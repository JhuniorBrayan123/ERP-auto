import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import type {ChildProcess} from 'node:child_process';
import {spawn as nodeSpawn} from 'node:child_process';
import {checkbox, input, select} from '@inquirer/prompts';
import crossSpawn from 'cross-spawn';
import Fuse from 'fuse.js';

const {
    getSetupStateSummary,
    areAllSetupsComplete,
    forceCompleteAllSetups,
    PV_SETUP_NAMES,
    LOG_SETUP_NAMES
} = await import('@utils/setup-state.js');
const {cargarMapaDesdeCache, guardarMapaEnCache, cargarMapaCodigos} = await import('../src/factories/item-factory.js');
const {normalizeMention, envFlag} = await import('../config/env.js');
const {
    formatDiscordMessage,
    loadPartialsFromDisk,
    mergePartials,
    postToDiscord,
} = await import('../src/utils/discord-reporter.js');

const ROOT_DIR = process.cwd();
const TESTS_DIR = path.join(ROOT_DIR, 'tests');

type ProjectKey = 'PuntoVenta' | 'Facturacion' | 'Logistica' | 'Clientes';

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
    Facturacion: {
        projectFlag: 'Facturacion',
        testDir: path.join(TESTS_DIR, 'Emisiones', 'PuntoVenta', 'VistaFacturacion'),
        outputDir: 'test-results/facturacion',
    },
    Logistica: {
        projectFlag: 'Logistica',
        testDir: path.join(TESTS_DIR, 'Logistica'),
        outputDir: 'test-results/logistica',
    },
    Clientes: {
        projectFlag: 'Clientes',
        testDir: path.join(TESTS_DIR, 'ClientesProveedores'),
        outputDir: 'test-results/clientes',
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
        fs.mkdirSync(outputDir, {recursive: true});
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

    tags?: string[];
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

const FACTURACION_REL = 'tests/Emisiones/PuntoVenta/VistaFacturacion';
function isPathAllowedForProject (projectKey : ProjectKey, absPath: string): boolean{
    if(projectKey !== 'PuntoVenta') return true;
    const rel = toRelative(absPath);
    return rel !== FACTURACION_REL && !rel.startsWith(FACTURACION_REL + '/');
}

function listEntries(currentDir: string): ExplorerEntry[] {
    const entries = fs.readdirSync(currentDir, {withFileTypes: true});

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

    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {

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

    const tagRegex = /@[\w.-]+/g;

    const tests: TestCase[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
        const title = match[1];
        const tags = title.match(tagRegex) ?? undefined;
        tests.push({title, filePath, tags});
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

function normalizeText(text: string): string {
    return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function tokenMatch(query: string, target: string): boolean {
    const tokens = query.trim().toLowerCase().split(/\s+/);
    const normalized = normalizeText(target);
    return tokens.every(token => normalized.includes(token));
}

let _fuseInstance: Fuse<TestCase> | null = null;

function getFuseInstance(tests: TestCase[]): Fuse<TestCase> {
    if (!_fuseInstance) {
        _fuseInstance = new Fuse(tests, {
            keys: ['title'],
            threshold: 0.4,
            includeScore: true,
        });
    }
    return _fuseInstance;
}

function formatCommand(args: string[]): string {
    return ['npx', 'playwright', 'test', ...args].map(quoteArg).join(' ');
}

async function cargarCacheActual(): Promise<void> {
    const envGroup = (process.env.APP_ENV ?? '').trim().toLowerCase() === 'prd' ? 'prd' : 'crt-group';
    const currentAccount = (process.env.USER_EMAIL ?? '').trim().toLowerCase() || 'unknown';

    const cacheMapa = cargarMapaDesdeCache(envGroup, currentAccount);

    // Check missing items regardless of where it's loaded from
    const checkMissing = async (mapa: any) => {
        if (envGroup === 'prd') return;
        let needsToRun = false;
        try {
            const {ITEM_TEMPLATES} = await import('../src/factories/item-factory.js');
            for (const template of ITEM_TEMPLATES) {
                if (template.fase && !mapa[template.key]) {
                    console.log(`[setup-state] Ítem faltante detectado por test-runner: ${template.key}. Forzando setup...`);
                    needsToRun = true;
                    break;
                }
            }
        } catch (e) {
            console.warn('[Cache] Error al verificar ITEM_TEMPLATES:', e instanceof Error ? e.message : String(e));
        }
        if (needsToRun) {
            const {markSetupIncomplete} = await import('@utils/setup-state.js');
            markSetupIncomplete('punto-venta-items');
            delete process.env.SKIP_PV_ITEMS_SETUP;
        }
    };

    if (cacheMapa) {
        console.log(`[Cache] Items cargados desde cache: ${envGroup} / ${currentAccount}`);
        await checkMissing(cacheMapa);
        return;
    }

    const authItemsFile = path.join(ROOT_DIR, 'playwright', '.auth', 'dynamic-items.json');

    if (envGroup === 'prd') {
        const prdItemsFile = path.join(ROOT_DIR, 'playwright', 'dynamic-items.prd.json');
        try {
            const prdContent = fs.readFileSync(prdItemsFile, 'utf-8');
            const prdMapa = JSON.parse(prdContent);
            if (!fs.existsSync(path.dirname(authItemsFile))) {
                fs.mkdirSync(path.dirname(authItemsFile), {recursive: true});
            }
            fs.writeFileSync(authItemsFile, JSON.stringify(prdMapa, null, 2), 'utf-8');
            guardarMapaEnCache(prdMapa, envGroup, currentAccount);
            console.log(`[Cache] PRD seed copiado a cache: ${envGroup} / ${currentAccount}`);
        } catch {
            console.warn('[PRD] No se pudo cargar dynamic-items.prd.json — ¿existe el archivo?');
        }
        return;
    }
    try {
        if (fs.existsSync(authItemsFile)) {
            const crtContent = fs.readFileSync(authItemsFile, 'utf-8');
            const crtMapa = JSON.parse(crtContent);
            guardarMapaEnCache(crtMapa, envGroup, currentAccount);
            console.log(`[Cache] CRT cache creado desde dynamic-items.json (RUN_ID: ${crtMapa.RUN_ID})`);

            await checkMissing(crtMapa);

        } else {
            console.warn(`[Cache] No hay cache para ${envGroup} / ${currentAccount}. ` +
                `Ejecuta setups o copia tus códigos a playwright/.auth/dynamic-items.json`);
        }
    } catch {
        console.warn('[Cache] dynamic-items.json inválido — revisa el formato del archivo');
    }
}

export function applySetupSelections(selected: string[]): void {

    if (selected.includes('auth') || selected.includes('punto-venta-datos')) {
        delete process.env.SKIP_PV_SETUP;
    } else {
        process.env.SKIP_PV_SETUP = '1';
    }

    if (selected.includes('punto-venta-items')) {
        delete process.env.SKIP_PV_ITEMS_SETUP;
    } else {
        process.env.SKIP_PV_ITEMS_SETUP = '1';
    }

    if (selected.includes('datos-adicionales')) {
        delete process.env.SKIP_DATOS_SETUP;
    } else {
        process.env.SKIP_DATOS_SETUP = '1';
    }
}

function getDefaultSetups(projectKey?: ProjectKey): string[] {
    if (projectKey === 'PuntoVenta' || projectKey === 'Facturacion') return [...PV_SETUP_NAMES];
    if (projectKey === 'Logistica') return [...LOG_SETUP_NAMES];
    if (projectKey === 'Clientes') return ['auth'];

    return [...PV_SETUP_NAMES, ...LOG_SETUP_NAMES];
}

async function askRunOptions(projectKey?: ProjectKey): Promise<string[]> {

    const stateSummary = getSetupStateSummary();
    console.log('\n──────────────────────────────────────');
    console.log('Estado de setups:');
    console.log(stateSummary);
    console.log('──────────────────────────────────────\n');

    if (areAllSetupsComplete()) {
        console.log('[setup-state] Todos los setups completados — saltando ejecución de setups\n');

        process.env.SKIP_PV_ITEMS_SETUP = '1';
        process.env.SKIP_DATOS_SETUP = '1';

        await cargarCacheActual();

        return [];
    }

    const defaults = getDefaultSetups(projectKey);

    const CONFIG_NAME = {
        name: '─'.repeat(30),
        value: '__SEPARATOR__',
    } as const;

    const ALL_VALUE = '__SELECT_ALL__';
    const NONE_VALUE = '__SELECT_NONE__';

    const rawSelection = await checkbox<string>({
        message: `Selecciona los setups a ejecutar:\n` +
            `(Usa ESPACIO para marcar/desmarcar, ENTER para confirmar)`,
        pageSize: 10,
        loop: false,
        choices: [
            {name: '🔐 auth', value: 'auth', checked: defaults.includes('auth')},
            {name: '📦 pv-datos', value: 'punto-venta-datos', checked: defaults.includes('punto-venta-datos')},
            {name: '📦 pv-items', value: 'punto-venta-items', checked: defaults.includes('punto-venta-items')},
            {name: '📋 datos-adicionales', value: 'datos-adicionales', checked: defaults.includes('datos-adicionales')},
            {name: CONFIG_NAME.name, value: CONFIG_NAME.value, disabled: true},
            {name: '✓ Seleccionar todos', value: ALL_VALUE},
            {name: '○ Deseleccionar todos', value: NONE_VALUE},
            {name: '>> Marcar todos como completados (saltar y guardar estado)', value: '__FORCE_COMPLETE__'},
        ],
    });

    const FORCE_COMPLETE_VALUE = '__FORCE_COMPLETE__';

    let selected: string[];
    if (rawSelection.includes(FORCE_COMPLETE_VALUE)) {
        console.log(`\n[setup-state] Bypass manual invocado. Marcando todos los setups como completados...`);
        forceCompleteAllSetups();

        process.env.SKIP_PV_ITEMS_SETUP = '1';
        process.env.SKIP_DATOS_SETUP = '1';
        process.env.SKIP_PV_SETUP = '1';

        await cargarCacheActual();
        return [];
    } else if (rawSelection.includes(ALL_VALUE)) {
        selected = ['auth', 'punto-venta-datos', 'punto-venta-items', 'datos-adicionales'];
    } else if (rawSelection.includes(NONE_VALUE)) {
        selected = [];
    } else {
        selected = rawSelection.filter(v => v !== '__SEPARATOR__');
    }

    console.log(`\n[setup-selection] Setups seleccionados: ${selected.length > 0 ? selected.join(', ') : '(ninguno)'}`);

    applySetupSelections(selected);

    await cargarCacheActual();

    return [];
}

function buildArgs(projectContext: ProjectContext, extraArgs: string[], pathsToRun: string[]): string[] {
    const args: string[] = [];

    const currentProjectFlag = projectContext.projectFlag;
    const currentOutputDir = projectContext.outputDir;

    if (currentProjectFlag) {
        args.push('--project', currentProjectFlag);
    }
    args.push('--output', currentOutputDir);
    if (!projectContext.isRunAll) {
        args.push('--workers', '1');
    }
    return [...args, ...extraArgs];
}

/**
 * Env del child process para el reporter de Discord:
 * - `PW_DISCORD_PROJECT`: identifica el proyecto (todos los modos).
 * - modo `partial` (RunAll): agrega `PW_DISCORD_MODE=partial` → el reporter
 *   escribe su parcial y NO postea (el POST único lo hace consolidateDiscordReport).
 * - modo `direct` (single-project): PW_DISCORD_MODE NO se setea → el reporter
 *   postea directo desde onEnd.
 */
export function buildDiscordEnv(
    base: NodeJS.ProcessEnv,
    projectKey: ProjectKey,
    mode: 'partial' | 'direct',
): NodeJS.ProcessEnv {
    return {
        ...base,
        PW_DISCORD_PROJECT: projectKey,
        ...(mode === 'partial' ? {PW_DISCORD_MODE: 'partial'} : {}),
    };
}

/**
 * RunAll: consolida los parciales escritos por cada proyecto (modo partial) en
 * UN mensaje y lo postea una sola vez. Gate off → no-op. Parciales
 * faltantes/corruptos → `missing[]` + aviso (un crash de proyecto no tumba el
 * reporte). Respeta solo-fallos, dry-run y webhook ausente (no bloquea).
 */
export async function consolidateDiscordReport(
    partialsDir: string = path.join(ROOT_DIR, 'test-results', '.discord-partials'),
): Promise<void> {
    if (process.env.DISCORD_REPORT_ENABLED !== '1') {
        return;
    }

    const {partials, missing} = loadPartialsFromDisk(partialsDir, Object.keys(PROJECT_CONFIG));

    if (partials.length === 0) {
        console.warn('[discord-reporter] No hay parciales que consolidar — mensaje omitido.');
        return;
    }

    if (missing.length > 0) {
        console.warn(
            `[discord-reporter] Proyectos sin parcial (¿crashearon?): ${missing.join(', ')} — ` +
            `el reporte se consolida con los presentes.`,
        );
    }

    const payload = mergePartials(partials, missing);
    const hasFailures = payload.total.failed > 0 || payload.total.errors > 0;


    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        console.warn('[discord-reporter] DISCORD_WEBHOOK_URL no configurada — mensaje omitido (la corrida no se bloquea).');
        return;
    }

    const content = formatDiscordMessage(payload, {
        userId: normalizeMention(process.env.DISCORD_USER_ID),
    });
    await postToDiscord(content, {
        webhookUrl,
        dryRun: envFlag('DISCORD_DRY_RUN'),
    });
}

function formatCommandWithContext(args: string[], projectContext?: ProjectContext): string {
    const prefixArgs = projectContext ? buildArgs(projectContext, [], args) : [];
    return ['npx', 'playwright', 'test', ...prefixArgs, ...args].map(quoteArg).join(' ');
}

function runPlaywright(args: string[], projectContext?: ProjectContext): Promise<void> {
    return new Promise((resolve, reject) => {
        const ctx = projectContext || getProjectContext('PuntoVenta');
        const prefixedArgs = buildArgs(ctx, args, args);

        console.log('\nComando generado:\n');
        console.log(formatCommandWithContext(args, ctx));
        console.log('');

        const childEnv = buildDiscordEnv({
            ...process.env,
            PW_REPORT_OUTPUT: `${ctx.outputDir}/results.json`,
            PW_JUNIT_OUTPUT: `${ctx.outputDir}/junit.xml`,
            PW_HTML_OUTPUT: `playwright-report/${ctx.key.toLowerCase()}`,
        }, ctx.key, 'direct');

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
    const extraArgs = await askRunOptions(projectContext.key);
    await runPlaywright([toRelative(folderPath), ...extraArgs], projectContext);
}

async function runMultiplePaths(paths: string[], projectContext: ProjectContext): Promise<void> {
    if (!paths.length) {
        console.log('\nNo seleccionaste ningun elemento.\n');
        return;
    }

    const extraArgs = await askRunOptions(projectContext.key);
    await runPlaywright([...paths.map(toRelative), ...extraArgs], projectContext);
}

async function selectMultipleFromDirectory(currentDir: string, projectContext: ProjectContext): Promise<void> {
    
    let entries = listEntries(currentDir);

    entries = entries.filter(entry =>
        isPathAllowedForProject(projectContext.key, entry.path)
    );
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
            {name: '⬅ Volver', value: 'back' as const},
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
            {name: '⬅ Volver', value: null},
        ],
    });

    if (!selectedTest) return;

    const extraArgs = await askRunOptions(projectContext.key);

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
            {name: '⬅ Volver', value: 'back' as const},
        ],
    });

    if (!selections.length || selections.includes('back')) {
        return;
    }

    const selectedTests = selections.filter((s): s is TestCase => s !== 'back');

    const grepRegex = selectedTests.map((testCase) => escapeGrep(testCase.title)).join('|');

    const extraArgs = await askRunOptions(projectContext.key);

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
                {name: 'Ejecutar todo el archivo', value: 'run-file'},
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
                {name: 'Volver', value: 'back'},
            ],
        });

        if (action === 'back') return;

        if (action === 'run-file') {
            const extraArgs = await askRunOptions(projectContext.key);
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
        let entries = listEntries(currentDir);
        // Si estamos en PuntoVenta, ocultar la carpeta Facturacion (es proyecto separado)
        entries = entries.filter(entry =>
             isPathAllowedForProject(projectContext.key, entry.path)
            );

        const currentRelative = toRelative(currentDir) || 'tests';

        const choices = [
            {
                name: 'Ejecutar todos los tests de esta carpeta',
                value: {type: 'run-current-folder', path: currentDir} satisfies ExplorerSelection,
            },
            {
                name: 'Seleccionar varios de esta carpeta',
                value: {type: 'select-multiple', path: currentDir} satisfies ExplorerSelection,
                disabled: entries.length === 0 ? 'No hay elementos para seleccionar' : false,
            },
            ...entries.map((entry) => ({
                name: entry.type === 'folder' ? `📁 ${entry.name}` : `⚡  ${entry.name}`,
                value: entry satisfies ExplorerSelection,
            })),
            {
                name: currentDir === projectTestDir ? 'Volver al menu principal' : 'Subir carpeta',
                value: {type: 'back'} satisfies ExplorerSelection,
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

    const allTests = walkSpecFiles(projectContext.testDir)
    .filter(filePath => isPathAllowedForProject(projectContext.key, filePath))
    .flatMap(extractTestsFromFile);
    
    const trimmed = query.trim();

    const tokenMatches = allTests.filter((testCase) => {
        if (tokenMatch(trimmed, testCase.title)) return true;
        if (testCase.tags?.length) {
            const tagsText = testCase.tags.join(' ');
            if (tokenMatch(trimmed, tagsText)) return true;
        }
        return false;
    });

    let matches: TestCase[];

    if (tokenMatches.length > 0) {
        matches = tokenMatches;
    } else {
        console.log('[Búsqueda] Sin resultados exactos — probando fuzzy search...');
        const fuse = getFuseInstance(allTests);
        const fuseResults = fuse.search(trimmed);
        matches = fuseResults.map(r => r.item);
    }

    if (!matches.length) {
        console.log('\nNo se encontraron tests con esa busqueda.\n');
        return;
    }

    const selectedTest = await select<TestCase | null>({
        message: `Resultados para "${query}" (${matches.length})`,
        pageSize: 20,
        choices: [
            ...matches.map((testCase, index) => ({
                name: `${index + 1}. ${testCase.title}${testCase.tags?.length ? ` ${testCase.tags.join(' ')}` : ''} | ${toRelative(testCase.filePath)}`,
                value: testCase,
            })),
            {name: '⬅ Volver al menu principal', value: null},
        ],
    });

    if (!selectedTest) return;

    const extraArgs = await askRunOptions(projectContext.key);

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

    const files = walkSpecFiles(projectContext.testDir)
    .filter(filePath => isPathAllowedForProject(projectContext.key, filePath));
    const trimmed = query.trim();

    const tokenFileMatches = files.filter((filePath) =>
        tokenMatch(trimmed, toRelative(filePath)),
    );

    let matches: string[];

    if (tokenFileMatches.length > 0) {
        matches = tokenFileMatches;
    } else {
        console.log('[Búsqueda] Sin resultados exactos — probando fuzzy search...');
        const fileTestCases: TestCase[] = files.map(f => ({title: toRelative(f), filePath: f}));
        const fuse = getFuseInstance(fileTestCases);
        matches = fuse.search(trimmed).map(r => r.item.filePath);
    }

    if (!matches.length) {
        console.log('\nNo se encontraron archivos con esa busqueda.\n');
        return;
    }

    const selectedFile = await select<string | null>({
        message: `Archivos encontrados para "${query}" (${matches.length})`,
        pageSize: 20,
        choices: [
            ...matches.map((filePath, index) => ({
                name: `${index + 1}. ${toRelative(filePath)}`,
                value: filePath,
            })),
            {name: '⬅ Volver al menu principal', value: null},
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

    const extraArgs = await askRunOptions(projectContext.key);

    const args = ['--grep', grep.trim(), ...extraArgs];
    await runPlaywright(args, projectContext);
}

async function runPlaywrightUi(projectContext: ProjectContext): Promise<void> {
    await askRunOptions(projectContext.key);
    await runPlaywright(['--ui'], projectContext);
}

async function selectProject(): Promise<'PuntoVenta' | 'Facturacion' | 'Logistica' | 'Clientes' | 'RunAllSequential' | 'RunAllDual' | 'exit'> {
    const choice = await select<'PuntoVenta' | 'Facturacion' | 'Logistica' | 'Clientes' | 'RunAllSequential' | 'RunAllDual' | 'exit'>({
        message: 'ERP2 AUTO - TEST RUNNER — Selecciona proyecto:',
        choices: [
            {name: '1. PuntoVenta (+ Busqueda + Cierre Caja)', value: 'PuntoVenta'},
            {name: '2. Facturacion', value: 'Facturacion'},
            {name: '3. Logistica', value: 'Logistica'},
            {name: '4. Clientes', value: 'Clientes'},
            {name: '5. Run All (Secuencial)', value: 'RunAllSequential'},
            {name: '6. Run All (Terminales separadas)', value: 'RunAllDual'},
            {name: '7. Salir', value: 'exit'},
        ],
    });
    return choice;
}

/** Env base de child process: reportes (JSON/JUnit/HTML) por proyecto. */
function buildChildEnv(outputDir: string, htmlDir: string): NodeJS.ProcessEnv {
    return {
        ...process.env,
        PW_REPORT_OUTPUT: `${outputDir}/results.json`,
        PW_JUNIT_OUTPUT: `${outputDir}/junit.xml`,
        PW_HTML_OUTPUT: `playwright-report/${htmlDir}`,
    };
}

async function runAllSequential(): Promise<void> {
    await askRunOptions();

    const pvOutput = PROJECT_CONFIG.PuntoVenta.outputDir;
    const facOutput = PROJECT_CONFIG.Facturacion.outputDir;
    const logOutput = PROJECT_CONFIG.Logistica.outputDir;
    const cliOutput = PROJECT_CONFIG.Clientes.outputDir;

    const pvArgs = ['--project', 'PuntoVenta', '--output', pvOutput];
    const facArgs = ['--project', 'Facturacion', '--output', facOutput];
    const logArgs = ['--project', 'Logistica', '--output', logOutput];
    const cliArgs = ['--project', 'Clientes', '--output', cliOutput];

    // RunAll: cada child escribe su parcial (PW_DISCORD_MODE=partial, sin POST);
    // consolidateDiscordReport() postea UNA vez al final.
    const pvEnv = buildDiscordEnv(buildChildEnv(pvOutput, 'puntoventa'), 'PuntoVenta', 'partial');
    const facEnv = buildDiscordEnv(buildChildEnv(facOutput, 'facturacion'), 'Facturacion', 'partial');
    const logEnv = buildDiscordEnv(buildChildEnv(logOutput, 'logistica'), 'Logistica', 'partial');
    const cliEnv = buildDiscordEnv(buildChildEnv(cliOutput, 'clientes'), 'Clientes', 'partial');

    ensureOutputDirs(pvOutput);
    ensureOutputDirs(facOutput);
    ensureOutputDirs(logOutput);
    ensureOutputDirs(cliOutput);
    ensureOutputDirs('playwright-report/puntoventa');
    ensureOutputDirs('playwright-report/facturacion');
    ensureOutputDirs('playwright-report/logistica');
    ensureOutputDirs('playwright-report/clientes');

    const suites: Array<{ name: string; args: string[]; env: NodeJS.ProcessEnv }> = [
        {name: 'PuntoVenta', args: pvArgs, env: pvEnv},
        {name: 'Facturacion', args: facArgs, env: facEnv},
        {name: 'Logistica', args: logArgs, env: logEnv},
        {name: 'Clientes', args: cliArgs, env: cliEnv},
    ];

    const exitCodes: Record<string, number | null> = {};

    for (const suite of suites) {
        console.log(`\n=== Ejecutando Suite: ${suite.name} ===\n`);
        exitCodes[suite.name] = await new Promise<number | null>((resolve) => {
            const child = crossSpawn('npx', ['playwright', 'test', ...suite.args], {
                stdio: 'inherit',
                shell: false,
                env: suite.env,
            });
            currentChildren.push(child);
            child.on('close', (code) => {
                currentChildren = currentChildren.filter(c => c !== child);
                resolve(code);
            });
        });
    }

    console.log('\n=== Run All Summary ===');
    for (const [name, code] of Object.entries(exitCodes)) {
        console.log(`${name}: exit code ${code}`);
    }
    console.log('=======================\n');

    // RunAll → UN mensaje consolidado en Discord (gate on; dry-run → solo log).
    await consolidateDiscordReport();
}

async function runAllDualTerminal(): Promise<void> {
    const pvOutput = PROJECT_CONFIG.PuntoVenta.outputDir;
    const facOutput = PROJECT_CONFIG.Facturacion.outputDir;
    const logOutput = PROJECT_CONFIG.Logistica.outputDir;
    const cliOutput = PROJECT_CONFIG.Clientes.outputDir;

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Ejecutar en TERMINALES separadas');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Una sola consola no puede mostrar múltiples streams de');
    console.log('output simultáneamente sin mezclarlos. Para ver cada');
    console.log('proyecto en paralelo con output limpio, abrí cuatro');
    console.log('terminales:\n');
    console.log('┌─ Terminal 1 (PuntoVenta) ──────────────────────────┐');
    console.log(`│  npx playwright test --project PuntoVenta          │`);
    console.log(`│    --output ${pvOutput.padEnd(38)}│`);
    console.log('└────────────────────────────────────────────────────┘\n');
    console.log('┌─ Terminal 2 (Facturacion) ─────────────────────────┐');
    console.log(`│  npx playwright test --project Facturacion         │`);
    console.log(`│    --output ${facOutput.padEnd(38)}│`);
    console.log('└────────────────────────────────────────────────────┘\n');
    console.log('┌─ Terminal 3 (Logistica) ───────────────────────────┐');
    console.log(`│  npx playwright test --project Logistica           │`);
    console.log(`│    --output ${logOutput.padEnd(38)}│`);
    console.log('└────────────────────────────────────────────────────┘\n');
    console.log('┌─ Terminal 4 (Clientes) ────────────────────────────┐');
    console.log(`│  npx playwright test --project Clientes            │`);
    console.log(`│    --output ${cliOutput.padEnd(38)}│`);
    console.log('└────────────────────────────────────────────────────┘\n');
    console.log('Los reportes se guardarán separados automáticamente.');
    console.log('═══════════════════════════════════════════════════════\n');
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

        if (projectChoice === 'RunAllDual') {
            await runAllDualTerminal();
            continue;
        }

        const projectContext = getProjectContext(projectChoice);
        const projectTestDir = projectContext.testDir;
        const projectLabel = projectChoice;

        while (true) {
            const option = await select<'explore' | 'search-test' | 'search-file' | 'grep' | 'ui' | 'back'>({
                message: `Submenu para ${projectLabel}:`,
                choices: [
                    {name: '📁 Explorar modulos / carpetas / archivos / tests', value: 'explore'},
                    {name: '🔍 Buscar test especifico por nombre o tag', value: 'search-test'},
                    {name: '🔍 Buscar archivo .spec.ts', value: 'search-file'},
                    {name: '⚡ Ejecutar grep manual', value: 'grep'},
                    {name: '🔓 Abrir Playwright UI', value: 'ui'},
                    {name: '⏪ Volver al menu principal', value: 'back'},
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

/**
 * Solo ejecuta el menú interactivo cuando este módulo es el punto de entrada
 * (`tsx scripts/test-runner.mts`). Al ser importado (tests unitarios) no dispara
 * el menú — evita que las suites que lo importan se cuelguen.
 */
function isMainModule(): boolean {
    if (!process.argv[1]) return false;
    try {
        const self = import.meta.url;
        const arg = pathToFileURL(path.resolve(process.argv[1])).href;
        return process.platform === 'win32'
            ? self.toLowerCase() === arg.toLowerCase()
            : self === arg;
    } catch {
        return false;
    }
}

if (isMainModule()) {
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
}
