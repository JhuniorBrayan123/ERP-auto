import fs from 'node:fs';
import path from 'node:path';
import type { ChildProcess } from 'node:child_process';
import { spawn as nodeSpawn } from 'node:child_process';
import { checkbox, confirm, input, select } from '@inquirer/prompts';
import crossSpawn from 'cross-spawn';
import {getSetupStateSummary, areAllSetupsComplete, markSetupIncomplete} from '@utils/setup-state';
import { getFailedTests, type FailedTestGroup } from './analyze-results';
import { cargarMapaDesdeCache, guardarMapaEnCache, cargarMapaCodigos } from '../src/factories/item-factory';

const ROOT_DIR = process.cwd();
const TESTS_DIR = path.join(ROOT_DIR, 'tests');

type ProjectKey = 'PuntoVenta' | 'Logistica' | 'TODO';

interface ProjectContext {
    key: ProjectKey;
    projectFlag: string | null;
    testDir: string;
    outputDir: string;
    isRunAll: boolean;
}

const PROJECT_CONFIG: Record<ProjectKey, { projectFlag: string | null; testDir: string; outputDir: string }> = {
    PuntoVenta: {
        projectFlag: 'PuntoVenta',
        testDir: path.join(TESTS_DIR, 'Emisiones'),
        outputDir: 'test-results/puntoventa',
    },
    Logistica: {
        projectFlag: 'Logistica',
        testDir: path.join(TESTS_DIR, 'Logistica'),
        outputDir: 'test-results/logistica',
    },
    TODO: {
        projectFlag: null,
        testDir: TESTS_DIR,
        outputDir: 'test-results/todo',
    },
};

function getProjectContext(key: ProjectKey, isRunAll = false): ProjectContext {
    const config = PROJECT_CONFIG[key];
    return {
        key,
        projectFlag: config.projectFlag,
        testDir: config.testDir,
        outputDir: config.outputDir,
        isRunAll,
    };
}

function ensureOutputDirs(outputDir: string): void {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
}

let currentChildren: ChildProcess[] = [];

type EntryType = 'folder' | 'file';

interface ExplorerEntry {
    name: string;
    path: string;
    type: EntryType;
}

interface TestCase {
    title: string;
    filePath: string;
}

type ExplorerSelection =
    | ExplorerEntry
    | { type: 'run-current-folder'; path: string }
    | { type: 'select-multiple'; path: string }
    | { type: 'back' };

function killCurrentChildren(): void {
    if (currentChildren.length === 0) return;

    console.log('\nDeteniendo ejecucion de Playwright...\n');

    for (const child of currentChildren) {
        if (!child?.pid) continue;

        if (process.platform === 'win32') {
            nodeSpawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
                stdio: 'ignore',
                shell: false,
            });
        } else {
            child.kill('SIGTERM');
        }
    }

    currentChildren = [];
}

process.on('SIGINT', () => {
    killCurrentChildren();
    process.exit(130);
});

process.on('SIGTERM', () => {
    killCurrentChildren();
    process.exit(143);
});

function exists(targetPath: string): boolean {
    return fs.existsSync(targetPath);
}

function isDirectory(targetPath: string): boolean {
    return exists(targetPath) && fs.statSync(targetPath).isDirectory();
}

function isSpecFile(targetPath: string): boolean {
    return exists(targetPath) && fs.statSync(targetPath).isFile() && targetPath.endsWith('.spec.ts');
}

function toRelative(targetPath: string): string {
    return path.relative(ROOT_DIR, targetPath).replace(/\\/g, '/');
}

function listEntries(currentDir: string): ExplorerEntry[] {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    const folders: ExplorerEntry[] = entries
        .filter((entry) => entry.isDirectory())
        .map((entry): ExplorerEntry => ({
            name: entry.name,
            path: path.join(currentDir, entry.name),
            type: 'folder',
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'es'));

    const files: ExplorerEntry[] = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.spec.ts'))
        .map((entry): ExplorerEntry => ({
            name: entry.name,
            path: path.join(currentDir, entry.name),
            type: 'file',
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'es'));

    return [...folders, ...files];
}

function walkSpecFiles(dir: string, result: string[] = []): string[] {
    if (!isDirectory(dir)) return result;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            walkSpecFiles(fullPath, result);
        }

        if (entry.isFile() && entry.name.endsWith('.spec.ts')) {
            result.push(fullPath);
        }
    }

    return result;
}

function extractTestsFromFile(filePath: string): TestCase[] {
    const content = fs.readFileSync(filePath, 'utf8');

    const regex = /(?:^|\n)\s*test(?:\.(?:only|skip|fixme))?\s*\(\s*['"`]([^'"`]+)['"`]/g;

    const tests: TestCase[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
        tests.push({ title: match[1], filePath });
    }

    return tests;
}

function escapeGrep(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function quoteArg(arg: string): string {
    if (!arg.trim()) return '""';

    if (/[\s|&<>^()]/.test(arg)) {
        return `"${arg.replace(/"/g, '\\"')}"`;
    }

    return arg;
}

function formatCommand(args: string[]): string {
    return ['npx', 'playwright', 'test', ...args].map(quoteArg).join(' ');
}

/**
 * Carga el cache de items dinámicos para el entorno y cuenta actual.
 * 
 * REGLA: Solo CARGA, nunca guarda. Quien guarda es el setup
 * (punto-venta-items.setup.ts) cuando completa exitosamente.
 * 
 * 1. Busca cache para (env_actual, cuenta_actual)
 * 2. Si no hay cache y es PRD, seed desde dynamic-items.prd.json
 */
function cargarCacheActual(): void {
    const envGroup = (process.env.APP_ENV ?? '').trim().toLowerCase() === 'prd' ? 'prd' : 'crt-group';
    const currentAccount = (process.env.USER_EMAIL ?? '').trim().toLowerCase() || 'unknown';

    // Intentar cargar desde cache para (entorno_actual, cuenta_actual)
    const cacheMapa = cargarMapaDesdeCache(envGroup, currentAccount);
    if (cacheMapa) {
        console.log(`[Cache] Items cargados desde cache: ${envGroup} / ${currentAccount}`);
        return;
    }

    // PRD: seed desde dynamic-items.prd.json si no hay cache
    if (envGroup === 'prd') {
        const prdItemsFile = path.join(ROOT_DIR, 'playwright', 'dynamic-items.prd.json');
        const authItemsFile = path.join(ROOT_DIR, 'playwright', '.auth', 'dynamic-items.json');
        try {
            const prdContent = fs.readFileSync(prdItemsFile, 'utf-8');
            const prdMapa = JSON.parse(prdContent);
            if (!fs.existsSync(path.dirname(authItemsFile))) {
                fs.mkdirSync(path.dirname(authItemsFile), { recursive: true });
            }
            fs.writeFileSync(authItemsFile, JSON.stringify(prdMapa, null, 2), 'utf-8');
            guardarMapaEnCache(prdMapa, envGroup, currentAccount);
            console.log(`[Cache] PRD seed copiado a cache: ${envGroup} / ${currentAccount}`);
        } catch {
            console.warn('[PRD] No se pudo cargar dynamic-items.prd.json — ¿existe el archivo?');
        }
        return;
    }

    // CRT sin cache
    console.warn(`[Cache] No hay cache para ${envGroup} / ${currentAccount}. Ejecuta setups primero.`);
}

async function askRunOptions(): Promise<string[]> {
    // Mostrar estado actual de los setups
    const stateSummary = getSetupStateSummary();
    console.log('\n──────────────────────────────────────');
    console.log('Estado de setups:');
    console.log(stateSummary);
    console.log('──────────────────────────────────────\n');

    // Si todos los setups están completados, auto-responder que no
    if (areAllSetupsComplete()) {
        console.log('[setup-state] Todos los setups completados — saltando ejecución de setups\n');
        // Salteamos items (lento) y datos-adicionales.
        process.env.SKIP_PV_ITEMS_SETUP = '1';
        process.env.SKIP_DATOS_SETUP = '1';

        // Forzamos auth a re-ejecutarse aunque esté completado.
        // Auth es rápido (~10s) y permite refrescar sesión si expiró.
        markSetupIncomplete('auth');

        // Cargar cache para asegurar dynamic-items.json correcto
        cargarCacheActual();

        return [];
    }

    const ejecutarSetups = await confirm({
        message: 'Ejecutar setups automatizados (crear datos)? (Dile NO si ya corriste los tests antes)',
        default: false,
    });

    if (!ejecutarSetups) {
        // Salteamos items y datos.
        process.env.SKIP_PV_ITEMS_SETUP = '1';
        process.env.SKIP_DATOS_SETUP = '1';

        // Forzamos auth a re-ejecutarse aunque esté completado.
        // Auth es rápido (~10s) y permite refrescar sesión si expiró.
        markSetupIncomplete('auth');

        cargarCacheActual();
    } else {
        delete process.env.SKIP_PV_SETUP;
        delete process.env.SKIP_PV_ITEMS_SETUP;
        delete process.env.SKIP_DATOS_SETUP;
    }

    return [];
}

function buildArgs(projectContext: ProjectContext, extraArgs: string[]): string[] {
    const args: string[] = [];
    if (projectContext.projectFlag) {
        args.push('--project', projectContext.projectFlag);
    }
    args.push('--output', projectContext.outputDir);
    if (!projectContext.isRunAll) {
        args.push('--workers', '1');
    }
    return [...args, ...extraArgs];
}

function formatCommandWithContext(args: string[], projectContext?: ProjectContext): string {
    const prefixArgs = projectContext ? buildArgs(projectContext, []) : [];
    return ['npx', 'playwright', 'test', ...prefixArgs, ...args].map(quoteArg).join(' ');
}

function runPlaywright(args: string[], projectContext?: ProjectContext): Promise<void> {
    return new Promise((resolve, reject) => {
        const ctx = projectContext || getProjectContext('TODO');
        const prefixedArgs = buildArgs(ctx, args);

        console.log('\nComando generado:\n');
        console.log(formatCommandWithContext(args, ctx));
        console.log('');

        const childEnv = {
            ...process.env,
            PW_REPORT_OUTPUT: `${ctx.outputDir}/results.json`,
            PW_JUNIT_OUTPUT: `${ctx.outputDir}/junit.xml`,
            PW_HTML_OUTPUT: `playwright-report/${ctx.key.toLowerCase()}`,
        };

        ensureOutputDirs(ctx.outputDir);
        ensureOutputDirs(`playwright-report/${ctx.key.toLowerCase()}`);

        const child = crossSpawn('npx', ['playwright', 'test', ...prefixedArgs], {
            stdio: 'inherit',
            shell: false,
            env: childEnv,
        });

        currentChildren.push(child);

        child.on('error', (error) => {
            currentChildren = currentChildren.filter(c => c !== child);
            reject(error);
        });

        child.on('close', (code) => {
            currentChildren = currentChildren.filter(c => c !== child);
            console.log(`\nEjecucion finalizada con codigo: ${code}\n`);
            resolve();
        });
    });
}

async function runFolder(folderPath: string, projectContext: ProjectContext): Promise<void> {
    const extraArgs = await askRunOptions();
    await runPlaywright([toRelative(folderPath), ...extraArgs], projectContext);
}

async function runMultiplePaths(paths: string[], projectContext: ProjectContext): Promise<void> {
    if (!paths.length) {
        console.log('\nNo seleccionaste ningun elemento.\n');
        return;
    }

    const extraArgs = await askRunOptions();
    await runPlaywright([...paths.map(toRelative), ...extraArgs], projectContext);
}

async function selectMultipleFromDirectory(currentDir: string, projectContext: ProjectContext): Promise<void> {
    const entries = listEntries(currentDir);

    if (!entries.length) {
        console.log('\nEsta carpeta no tiene subcarpetas ni archivos .spec.ts.\n');
        return;
    }

    const selections = await checkbox<ExplorerEntry | 'back'>({
        message: `Selecciona carpetas o archivos de ${toRelative(currentDir) || 'tests'}:
Usa ESPACIO para marcar/desmarcar y ENTER para confirmar.`,
        pageSize: 20,
        choices: [
            ...entries.map((entry) => ({
                name: entry.type === 'folder' ? `📁 ${entry.name}` : `📄 ${entry.name}`,
                value: entry as ExplorerEntry | 'back',
            })),
            { name: '⬅ Volver', value: 'back' as const },
        ],
    });

    if (!selections.length || selections.includes('back')) {
        return;
    }

    const selectedEntries = selections.filter((s): s is ExplorerEntry => s !== 'back');
    await runMultiplePaths(selectedEntries.map((entry) => entry.path), projectContext);
}

async function runSingleTestFromFile(filePath: string, projectContext: ProjectContext): Promise<void> {
    const tests = extractTestsFromFile(filePath);

    if (!tests.length) {
        console.log('\nNo se encontraron tests en este archivo.\n');
        return;
    }

    const selectedTest = await select<TestCase | null>({
        message: 'Selecciona el test a ejecutar:',
        pageSize: 20,
        choices: [
            ...tests.map((testCase, index) => ({
                name: `${index + 1}. ${testCase.title}`,
                value: testCase,
            })),
            { name: '⬅ Volver', value: null },
        ],
    });

    if (!selectedTest) return;

    const extraArgs = await askRunOptions();

    await runPlaywright([
        toRelative(filePath),
        '--grep',
        escapeGrep(selectedTest.title),
        ...extraArgs,
    ], projectContext);
}

async function runMultipleTestsFromFile(filePath: string, projectContext: ProjectContext): Promise<void> {
    const tests = extractTestsFromFile(filePath);

    if (!tests.length) {
        console.log('\nNo se encontraron tests en este archivo.\n');
        return;
    }

    const selections = await checkbox<TestCase | 'back'>({
        message: `Selecciona los tests que quieres ejecutar:
Usa ESPACIO para marcar/desmarcar y ENTER para confirmar.`,
        pageSize: 20,
        choices: [
            ...tests.map((testCase, index) => ({
                name: `${index + 1}. ${testCase.title}`,
                value: testCase as TestCase | 'back',
            })),
            { name: '⬅ Volver', value: 'back' as const },
        ],
    });

    if (!selections.length || selections.includes('back')) {
        return;
    }

    const selectedTests = selections.filter((s): s is TestCase => s !== 'back');

    const grepRegex = selectedTests.map((testCase) => escapeGrep(testCase.title)).join('|');

    const extraArgs = await askRunOptions();

    await runPlaywright([
        toRelative(filePath),
        '--grep',
        grepRegex,
        ...extraArgs,
    ], projectContext);
}

async function runFile(filePath: string, projectContext: ProjectContext): Promise<void> {
    if (!isSpecFile(filePath)) {
        console.log('\nEl archivo seleccionado no es un .spec.ts valido.\n');
        return;
    }

    const tests = extractTestsFromFile(filePath);

    while (true) {
        const action = await select<'run-file' | 'run-single-test' | 'run-multiple-tests' | 'back'>({
            message: `Archivo: ${toRelative(filePath)}`,
            choices: [
                { name: 'Ejecutar todo el archivo', value: 'run-file' },
                {
                    name: 'Ejecutar un test especifico',
                    value: 'run-single-test',
                    disabled: tests.length === 0 ? 'No se encontraron tests en este archivo' : false,
                },
                {
                    name: 'Seleccionar varios tests del archivo',
                    value: 'run-multiple-tests',
                    disabled: tests.length === 0 ? 'No se encontraron tests en este archivo' : false,
                },
                { name: 'Volver', value: 'back' },
            ],
        });

        if (action === 'back') return;

        if (action === 'run-file') {
            const extraArgs = await askRunOptions();
            await runPlaywright([toRelative(filePath), ...extraArgs], projectContext);
        }

        if (action === 'run-single-test') {
            await runSingleTestFromFile(filePath, projectContext);
        }

        if (action === 'run-multiple-tests') {
            await runMultipleTestsFromFile(filePath, projectContext);
        }
    }
}

async function exploreDirectory(currentDir: string, projectContext: ProjectContext, projectTestDir: string): Promise<void> {
    while (true) {
        const entries = listEntries(currentDir);
        const currentRelative = toRelative(currentDir) || 'tests';

        const choices = [
            {
                name: 'Ejecutar todos los tests de esta carpeta',
                value: { type: 'run-current-folder', path: currentDir } satisfies ExplorerSelection,
            },
            {
                name: 'Seleccionar varios de esta carpeta',
                value: { type: 'select-multiple', path: currentDir } satisfies ExplorerSelection,
                disabled: entries.length === 0 ? 'No hay elementos para seleccionar' : false,
            },
            ...entries.map((entry) => ({
                name: entry.type === 'folder' ? `📁 ${entry.name}` : `⚡  ${entry.name}`,
                value: entry satisfies ExplorerSelection,
            })),
            {
                name: currentDir === projectTestDir ? 'Volver al menu principal' : 'Subir carpeta',
                value: { type: 'back' } satisfies ExplorerSelection,
            },
        ];

        const selected = await select<ExplorerSelection>({
            message: `Explorador: ${currentRelative}`,
            pageSize: 20,
            choices,
        });

        if (selected.type === 'back') {
            return;
        }

        if (selected.type === 'run-current-folder') {
            await runFolder(selected.path, projectContext);
            continue;
        }

        if (selected.type === 'select-multiple') {
            await selectMultipleFromDirectory(selected.path, projectContext);
            continue;
        }

        if (selected.type === 'folder') {
            await exploreDirectory(selected.path, projectContext, projectTestDir);
            continue;
        }

        if (selected.type === 'file') {
            await runFile(selected.path, projectContext);
        }
    }
}

async function searchGlobalTest(projectContext: ProjectContext): Promise<void> {
    const query = await input({
        message: 'Buscar test por nombre o tag, ejemplo MS-1, ingreso, @PV-1.1:',
    });

    if (!query.trim()) return;

    const allTests = walkSpecFiles(projectContext.testDir).flatMap(extractTestsFromFile);

    const matches = allTests.filter((testCase) =>
        testCase.title.toLowerCase().includes(query.trim().toLowerCase()),
    );

    if (!matches.length) {
        console.log('\nNo se encontraron tests con esa busqueda.\n');
        return;
    }

    const selectedTest = await select<TestCase | null>({
        message: `Resultados para "${query}"`,
        pageSize: 20,
        choices: [
            ...matches.map((testCase, index) => ({
                name: `${index + 1}. ${testCase.title} | ${toRelative(testCase.filePath)}`,
                value: testCase,
            })),
            { name: '⬅ Volver al menu principal', value: null },
        ],
    });

    if (!selectedTest) return;

    const extraArgs = await askRunOptions();

    await runPlaywright([
        toRelative(selectedTest.filePath),
        '--grep',
        escapeGrep(selectedTest.title),
        ...extraArgs,
    ], projectContext);
}

async function searchGlobalFile(projectContext: ProjectContext): Promise<void> {
    const query = await input({
        message: 'Buscar archivo .spec.ts, ejemplo MS-1, clonacion, boleta:',
    });

    if (!query.trim()) return;

    const files = walkSpecFiles(projectContext.testDir);

    const matches = files.filter((filePath) =>
        toRelative(filePath).toLowerCase().includes(query.trim().toLowerCase()),
    );

    if (!matches.length) {
        console.log('\nNo se encontraron archivos con esa busqueda.\n');
        return;
    }

    const selectedFile = await select<string | null>({
        message: `Archivos encontrados para "${query}"`,
        pageSize: 20,
        choices: [
            ...matches.map((filePath, index) => ({
                name: `${index + 1}. ${toRelative(filePath)}`,
                value: filePath,
            })),
            { name: '⬅ Volver al menu principal', value: null },
        ],
    });

    if (!selectedFile) return;

    await runFile(selectedFile, projectContext);
}

async function runManualGrep(projectContext: ProjectContext): Promise<void> {
    const grep = await input({
        message: 'Ingresa tag o texto para --grep, ejemplo @logistica, @MS-1, boleta:',
    });

    if (!grep.trim()) return;

    const extraArgs = await askRunOptions();

    const args = ['--grep', grep.trim(), ...extraArgs];
    await runPlaywright(args, projectContext);
}

async function runPlaywrightUi(projectContext: ProjectContext): Promise<void> {
    await askRunOptions();
    await runPlaywright(['--ui'], projectContext);
}

async function selectProject(): Promise<'PuntoVenta' | 'Logistica' | 'TODO' | 'RunAllSequential' | 'RunAllParallel' | 'RunAllDual' | 'RunAllFailed' | 'exit'> {
    const choice = await select<'PuntoVenta' | 'Logistica' | 'TODO' | 'RunAllSequential' | 'RunAllParallel' | 'RunAllDual' | 'RunAllFailed' | 'exit'>({
        message: 'ERP2 AUTO - TEST RUNNER — Selecciona proyecto:',
        choices: [
            { name: '1. PuntoVenta', value: 'PuntoVenta' },
            { name: '2. Logistica', value: 'Logistica' },
            { name: '3. TODO (tests generales)', value: 'TODO' },
            { name: '4. Run All (Secuencial: PV → LOG, output limpio)', value: 'RunAllSequential' },
            { name: '5. Run All (Paralelo: PV + LOG, output mezclado)', value: 'RunAllParallel' },
            { name: '6. Run All (Dos terminales: instrucciones)', value: 'RunAllDual' },
            { name: '7. 🔄 Re-ejecutar tests fallidos', value: 'RunAllFailed' },
            { name: '8. Salir', value: 'exit' },
        ],
    });
    return choice;
}

async function runAllSequential(): Promise<void> {
    await askRunOptions();

    const pvOutput = PROJECT_CONFIG.PuntoVenta.outputDir;
    const logOutput = PROJECT_CONFIG.Logistica.outputDir;

    const pvArgs = ['--project', 'PuntoVenta', '--output', pvOutput];
    const logArgs = ['--project', 'Logistica', '--output', logOutput];

    const pvEnv = { ...process.env, PW_REPORT_OUTPUT: `${pvOutput}/results.json`, PW_JUNIT_OUTPUT: `${pvOutput}/junit.xml`, PW_HTML_OUTPUT: `playwright-report/puntoventa` };
    const logEnv = { ...process.env, PW_REPORT_OUTPUT: `${logOutput}/results.json`, PW_JUNIT_OUTPUT: `${logOutput}/junit.xml`, PW_HTML_OUTPUT: `playwright-report/logistica` };

    ensureOutputDirs(pvOutput);
    ensureOutputDirs(logOutput);
    ensureOutputDirs('playwright-report/puntoventa');
    ensureOutputDirs('playwright-report/logistica');

    // ── PuntoVenta primero ─────────────────────────────────────────
    console.log('\n=== Ejecutando Suite: PuntoVenta ===\n');
    const pvExitCode = await new Promise<number | null>((resolve) => {
        const pv = crossSpawn('npx', ['playwright', 'test', ...pvArgs], {
            stdio: 'inherit',
            shell: false,
            env: pvEnv,
        });
        currentChildren.push(pv);
        pv.on('close', (code) => {
            currentChildren = currentChildren.filter(c => c !== pv);
            resolve(code);
        });
    });

    // ── Logistica después ──────────────────────────────────────────
    console.log('\n=== Ejecutando Suite: Logistica ===\n');
    const logExitCode = await new Promise<number | null>((resolve) => {
        const log = crossSpawn('npx', ['playwright', 'test', ...logArgs], {
            stdio: 'inherit',
            shell: false,
            env: logEnv,
        });
        currentChildren.push(log);
        log.on('close', (code) => {
            currentChildren = currentChildren.filter(c => c !== log);
            resolve(code);
        });
    });

    console.log('\n=== Run All Summary ===');
    console.log(`PuntoVenta: exit code ${pvExitCode}`);
    console.log(`Logistica:  exit code ${logExitCode}`);
    console.log('=======================\n');
}

async function runAllParallel(): Promise<void> {
    await askRunOptions();

    const pvOutput = PROJECT_CONFIG.PuntoVenta.outputDir;
    const logOutput = PROJECT_CONFIG.Logistica.outputDir;

    const pvArgs = ['--project', 'PuntoVenta', '--output', pvOutput];
    const logArgs = ['--project', 'Logistica', '--output', logOutput];

    console.log('\nComandos generados:\n');
    console.log(['npx', 'playwright', 'test', ...pvArgs].map(quoteArg).join(' '));
    console.log(['npx', 'playwright', 'test', ...logArgs].map(quoteArg).join(' '));
    console.log('');

    const pvEnv = { ...process.env, PW_REPORT_OUTPUT: `${pvOutput}/results.json`, PW_JUNIT_OUTPUT: `${pvOutput}/junit.xml`, PW_HTML_OUTPUT: `playwright-report/puntoventa` };
    const logEnv = { ...process.env, PW_REPORT_OUTPUT: `${logOutput}/results.json`, PW_JUNIT_OUTPUT: `${logOutput}/junit.xml`, PW_HTML_OUTPUT: `playwright-report/logistica` };

    ensureOutputDirs(pvOutput);
    ensureOutputDirs(logOutput);
    ensureOutputDirs('playwright-report/puntoventa');
    ensureOutputDirs('playwright-report/logistica');

    console.log('\n=== Ejecutando PuntoVenta + Logistica en paralelo ===\n');
    console.log('NOTA: El output se mezclará porque ambos procesos comparten la consola.\n');

    // Filter: only show Maven reporter lines
    const isRelevantLine = (line: string): boolean => {
        const t = line.trim();
        if (!t) return false;
        if (t.startsWith('-> Ejecutando:')) return false;
        if (t.startsWith('[dotenv@')) return false;
        if (t.includes('Códigos dinámicos activos')) return false;
        if (t.includes('agentic secret storage')) return false;
        if (t.includes('prevent committing')) return false;
        if (t.startsWith('Running setup')) return false;
        if (t.startsWith('Entorno:')) return false;
        return true;
    };

    const prefixStream = (stream: NodeJS.ReadableStream, prefix: string) => {
        stream.on('data', (data: Buffer | string) => {
            const lines = data.toString().split('\n');
            for (const line of lines) {
                if (isRelevantLine(line)) {
                    process.stdout.write(`${prefix} ${line}\n`);
                }
            }
        });
    };

    const runSuite = (args: string[], env: NodeJS.ProcessEnv, prefix: string): Promise<number | null> => {
        return new Promise((resolve) => {
            const child = crossSpawn('npx', ['playwright', 'test', ...args], {
                stdio: 'pipe',
                shell: false,
                env,
            });
            currentChildren.push(child);
            if (child.stdout) prefixStream(child.stdout, prefix);
            if (child.stderr) prefixStream(child.stderr, prefix);
            child.on('close', (code) => {
                currentChildren = currentChildren.filter(c => c !== child);
                resolve(code);
            });
        });
    };

    const [pvCode, logCode] = await Promise.all([
        runSuite(pvArgs, pvEnv, '[PV]'),
        runSuite(logArgs, logEnv, '[LOG]'),
    ]);

    console.log('\n=== Run All Summary ===');
    console.log(`PuntoVenta: exit code ${pvCode}`);
    console.log(`Logistica:  exit code ${logCode}`);
    console.log('=======================\n');
}

async function runAllDualTerminal(): Promise<void> {
    const pvOutput = PROJECT_CONFIG.PuntoVenta.outputDir;
    const logOutput = PROJECT_CONFIG.Logistica.outputDir;

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Ejecutar en DOS TERMINALES separadas');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Una sola consola no puede mostrar dos streams de output');
    console.log('simultáneamente sin mezclarlos. Para ver ambos proyectos');
    console.log('en paralelo con output limpio, abrí dos terminales:\n');
    console.log('┌─ Terminal 1 (PuntoVenta) ──────────────────────────┐');
    console.log(`│  npx playwright test --project PuntoVenta          │`);
    console.log(`│    --output ${pvOutput.padEnd(38)}│`);
    console.log('└────────────────────────────────────────────────────┘\n');
    console.log('┌─ Terminal 2 (Logistica) ───────────────────────────┐');
    console.log(`│  npx playwright test --project Logistica           │`);
    console.log(`│    --output ${logOutput.padEnd(38)}│`);
    console.log('└────────────────────────────────────────────────────┘\n');
    console.log('Los reportes se guardarán separados automáticamente.');
    console.log('═══════════════════════════════════════════════════════\n');
}

async function runFailedTests(): Promise<void> {
    const failedGroups = getFailedTests();

    if (failedGroups.length === 0) {
        // Check if results files exist at all
        const pvPath = path.join(PROJECT_CONFIG.PuntoVenta.outputDir, 'results.json');
        const logPath = path.join(PROJECT_CONFIG.Logistica.outputDir, 'results.json');

        if (!fs.existsSync(pvPath) && !fs.existsSync(logPath)) {
            console.log('\nNo se encontró results.json. Ejecuta primero Run All o Run Project.\n');
        } else {
            console.log('\nNo se encontraron tests fallidos para re-ejecutar.\n');
        }
        return;
    }

    for (const group of failedGroups) {
        const grepPattern = group.titles.map((t) => escapeGrep(t)).join('|');
        const projectKey = group.project as ProjectKey;
        const config = PROJECT_CONFIG[projectKey];
        const outputDir = config.outputDir;

        console.log(`\n=== Re-ejecutando ${group.titles.length} test(s) fallidos en ${group.project} ===\n`);

        const args = ['--project', group.project, '--grep', grepPattern, '--output', outputDir];

        const childEnv = {
            ...process.env,
            PW_REPORT_OUTPUT: `${outputDir}/results.json`,
            PW_JUNIT_OUTPUT: `${outputDir}/junit.xml`,
            PW_HTML_OUTPUT: `playwright-report/${projectKey.toLowerCase()}`,
        };

        ensureOutputDirs(outputDir);
        ensureOutputDirs(`playwright-report/${projectKey.toLowerCase()}`);

        const exitCode = await new Promise<number | null>((resolve) => {
            const child = crossSpawn('npx', ['playwright', 'test', ...args], {
                stdio: 'inherit',
                shell: false,
                env: childEnv,
            });
            currentChildren.push(child);
            child.on('close', (code) => {
                currentChildren = currentChildren.filter(c => c !== child);
                resolve(code);
            });
        });

        console.log(`\n${group.project} — exit code: ${exitCode}\n`);
    }
}

async function main(): Promise<void> {
    if (!isDirectory(TESTS_DIR)) {
        console.error('\nNo se encontro la carpeta tests en la raiz del proyecto.');
        console.error('Ejecuta este menu desde la raiz donde estan package.json y tests/.\n');
        process.exit(1);
    }

    while (true) {
        const projectChoice = await selectProject();

        if (projectChoice === 'exit') {
            killCurrentChildren();
            console.log('\nSaliendo...\n');
            process.exit(0);
        }

        if (projectChoice === 'RunAllSequential') {
            await runAllSequential();
            continue;
        }

        if (projectChoice === 'RunAllParallel') {
            await runAllParallel();
            continue;
        }

        if (projectChoice === 'RunAllDual') {
            await runAllDualTerminal();
            continue;
        }

        if (projectChoice === 'RunAllFailed') {
            await runFailedTests();
            continue;
        }

        const projectContext = getProjectContext(projectChoice);
        const projectTestDir = projectContext.testDir;
        const projectLabel = projectChoice === 'TODO' ? 'TODO' : projectChoice;

        while (true) {
            const option = await select<'explore' | 'search-test' | 'search-file' | 'grep' | 'ui' | 'back'>({
                message: `Submenu para ${projectLabel}:`,
                choices: [
                    { name: '📁 Explorar modulos / carpetas / archivos / tests', value: 'explore' },
                    { name: '🔍 Buscar test especifico por nombre o tag', value: 'search-test' },
                    { name: '🔍 Buscar archivo .spec.ts', value: 'search-file' },
                    { name: '⚡ Ejecutar grep manual', value: 'grep' },
                    { name: '🔓 Abrir Playwright UI', value: 'ui' },
                    { name: '⏪ Volver al menu principal', value: 'back' },
                ],
            });

            if (option === 'back') {
                break;
            }

            if (option === 'explore') {
                await exploreDirectory(projectTestDir, projectContext, projectTestDir);
            }

            if (option === 'search-test') {
                await searchGlobalTest(projectContext);
            }

            if (option === 'search-file') {
                await searchGlobalFile(projectContext);
            }

            if (option === 'grep') {
                await runManualGrep(projectContext);
            }

            if (option === 'ui') {
                await runPlaywrightUi(projectContext);
            }
        }
    }
}

function isExitPromptError(error: unknown): boolean {
    return (
        error instanceof Error &&
        (
            error.name === 'ExitPromptError' ||
            error.message.includes('SIGINT') ||
            error.message.includes('force closed')
        )
    );
}

main().catch((error: unknown) => {
    killCurrentChildren();

    if (isExitPromptError(error)) {
        console.log('\nMenú cancelado por el usuario.\n');
        process.exit(130);
    }

    console.error('\nError en el menú:\n');
    console.error(error);
    process.exit(1);
});
