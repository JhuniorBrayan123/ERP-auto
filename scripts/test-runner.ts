import fs from 'node:fs';
import path from 'node:path';
import type {ChildProcess} from 'node:child_process';
import {spawn as nodeSpawn} from 'node:child_process';
import {checkbox, confirm, input, select} from '@inquirer/prompts';
import crossSpawn from 'cross-spawn';

const ROOT_DIR = process.cwd();
const TESTS_DIR = path.join(ROOT_DIR, 'tests');

let currentChild: ChildProcess | null = null;

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

function killCurrentChild(): void {
    if (!currentChild?.pid) return;

    console.log('\nDeteniendo ejecucion de Playwright...\n');

    if (process.platform === 'win32') {
        nodeSpawn('taskkill', ['/pid', String(currentChild.pid), '/T', '/F'], {
            stdio: 'ignore',
            shell: false,
        });
    } else {
        currentChild.kill('SIGTERM');
    }

    currentChild = null;
}

process.on('SIGINT', () => {
    killCurrentChild();
    process.exit(130);
});

process.on('SIGTERM', () => {
    killCurrentChild();
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

    const tests: TestCase[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
        tests.push({title: match[1], filePath});
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

async function askRunOptions(): Promise<string[]> {
    const headed = await confirm({
        message: 'Ejecutar con navegador visible?',
        default: false,
    });

    const debug = await confirm({
        message: 'Ejecutar en modo debug?',
        default: false,
    });

    const projectAnswer = await input({
        message: 'Browser/proyecto opcional, ejemplo chromium/firefox/webkit. Enter para omitir:',
        default: '',
    });

    const workersAnswer = await input({
        message: 'Workers opcional, ejemplo 1, 2, 4. Enter para omitir:',
        default: '',
    });

    const retriesAnswer = await input({
        message: 'Reintentos opcional, ejemplo 1. Enter para omitir:',
        default: '',
    });

    const args: string[] = [];

    if (headed) args.push('--headed');
    if (debug) args.push('--debug');

    if (projectAnswer.trim()) {
        args.push('--project', projectAnswer.trim());
    }

    if (workersAnswer.trim()) {
        args.push('--workers', workersAnswer.trim());
    }

    if (retriesAnswer.trim()) {
        args.push('--retries', retriesAnswer.trim());
    }

    return args;
}

function runPlaywright(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log('\nComando generado:\n');
        console.log(formatCommand(args));
        console.log('');

        const child = crossSpawn('npx', ['playwright', 'test', ...args], {
            stdio: 'inherit',
            shell: false,
            env: process.env,
        });

        currentChild = child;

        child.on('error', (error) => {
            currentChild = null;
            reject(error);
        });

        child.on('close', (code) => {
            currentChild = null;
            console.log(`\nEjecucion finalizada con codigo: ${code}\n`);
            resolve();
        });
    });
}

async function runFolder(folderPath: string): Promise<void> {
    const extraArgs = await askRunOptions();
    await runPlaywright([toRelative(folderPath), ...extraArgs]);
}

async function runMultiplePaths(paths: string[]): Promise<void> {
    if (!paths.length) {
        console.log('\nNo seleccionaste ningun elemento.\n');
        return;
    }

    const extraArgs = await askRunOptions();
    await runPlaywright([...paths.map(toRelative), ...extraArgs]);
}

async function selectMultipleFromDirectory(currentDir: string): Promise<void> {
    const entries = listEntries(currentDir);

    if (!entries.length) {
        console.log('\nEsta carpeta no tiene subcarpetas ni archivos .spec.ts.\n');
        return;
    }

    const selectedEntries = await checkbox<ExplorerEntry>({
        message: `Selecciona carpetas o archivos de ${toRelative(currentDir) || 'tests'}:
Usa ESPACIO para marcar/desmarcar y ENTER para confirmar.`,
        pageSize: 20,
        choices: entries.map((entry) => ({
            name: entry.type === 'folder' ? `📁 ${entry.name}` : `📄 ${entry.name}`,
            value: entry,
        })),
    });
    await runMultiplePaths(selectedEntries.map((entry) => entry.path));
}

async function runSingleTestFromFile(filePath: string): Promise<void> {
    const tests = extractTestsFromFile(filePath);

    if (!tests.length) {
        console.log('\nNo se encontraron tests en este archivo.\n');
        return;
    }

    const selectedTest = await select<TestCase>({
        message: 'Selecciona el test a ejecutar:',
        pageSize: 20,
        choices: tests.map((testCase, index) => ({
            name: `${index + 1}. ${testCase.title}`,
            value: testCase,
        })),
    });

    const extraArgs = await askRunOptions();

    await runPlaywright([
        toRelative(filePath),
        '--grep',
        escapeGrep(selectedTest.title),
        ...extraArgs,
    ]);
}

async function runMultipleTestsFromFile(filePath: string): Promise<void> {
    const tests = extractTestsFromFile(filePath);

    if (!tests.length) {
        console.log('\nNo se encontraron tests en este archivo.\n');
        return;
    }

    const selectedTests = await checkbox<TestCase>({
        message: `Selecciona los tests que quieres ejecutar:
Usa ESPACIO para marcar/desmarcar y ENTER para confirmar.`,
        pageSize: 20,
        choices: tests.map((testCase, index) => ({
            name: `${index + 1}. ${testCase.title}`,
            value: testCase,
        })),
    });

    if (!selectedTests.length) {
        console.log('\nNo seleccionaste ningun test.\n');
        return;
    }

    const grepRegex = selectedTests.map((testCase) => escapeGrep(testCase.title)).join('|');

    const extraArgs = await askRunOptions();

    await runPlaywright([
        toRelative(filePath),
        '--grep',
        grepRegex,
        ...extraArgs,
    ]);
}

async function runFile(filePath: string): Promise<void> {
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
            const extraArgs = await askRunOptions();
            await runPlaywright([toRelative(filePath), ...extraArgs]);
        }

        if (action === 'run-single-test') {
            await runSingleTestFromFile(filePath);
        }

        if (action === 'run-multiple-tests') {
            await runMultipleTestsFromFile(filePath);
        }
    }
}

async function exploreDirectory(currentDir: string): Promise<void> {
    while (true) {
        const entries = listEntries(currentDir);
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
                name: currentDir === TESTS_DIR ? 'Volver al menu principal' : 'Subir carpeta',
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
            await runFolder(selected.path);
            continue;
        }

        if (selected.type === 'select-multiple') {
            await selectMultipleFromDirectory(selected.path);
            continue;
        }

        if (selected.type === 'folder') {
            await exploreDirectory(selected.path);
            continue;
        }

        if (selected.type === 'file') {
            await runFile(selected.path);
        }
    }
}

async function searchGlobalTest(): Promise<void> {
    const query = await input({
        message: 'Buscar test por nombre o tag, ejemplo MS-1, ingreso, @PV-1.1:',
    });

    if (!query.trim()) return;

    const allTests = walkSpecFiles(TESTS_DIR).flatMap(extractTestsFromFile);

    const matches = allTests.filter((testCase) =>
        testCase.title.toLowerCase().includes(query.trim().toLowerCase()),
    );

    if (!matches.length) {
        console.log('\nNo se encontraron tests con esa busqueda.\n');
        return;
    }

    const selectedTest = await select<TestCase>({
        message: `Resultados para "${query}"`,
        pageSize: 20,
        choices: matches.map((testCase, index) => ({
            name: `${index + 1}. ${testCase.title} | ${toRelative(testCase.filePath)}`,
            value: testCase,
        })),
    });

    const extraArgs = await askRunOptions();

    await runPlaywright([
        toRelative(selectedTest.filePath),
        '--grep',
        escapeGrep(selectedTest.title),
        ...extraArgs,
    ]);
}

async function searchGlobalFile(): Promise<void> {
    const query = await input({
        message: 'Buscar archivo .spec.ts, ejemplo MS-1, clonacion, boleta:',
    });

    if (!query.trim()) return;

    const files = walkSpecFiles(TESTS_DIR);

    const matches = files.filter((filePath) =>
        toRelative(filePath).toLowerCase().includes(query.trim().toLowerCase()),
    );

    if (!matches.length) {
        console.log('\nNo se encontraron archivos con esa busqueda.\n');
        return;
    }

    const selectedFile = await select<string>({
        message: `Archivos encontrados para "${query}"`,
        pageSize: 20,
        choices: matches.map((filePath, index) => ({
            name: `${index + 1}. ${toRelative(filePath)}`,
            value: filePath,
        })),
    });

    await runFile(selectedFile);
}

async function runManualGrep(): Promise<void> {
    const grep = await input({
        message: 'Ingresa tag o texto para --grep, ejemplo @logistica, @MS-1, boleta:',
    });

    if (!grep.trim()) return;

    const extraArgs = await askRunOptions();

    await runPlaywright(['--grep', grep.trim(), ...extraArgs]);
}

async function runPlaywrightUi(): Promise<void> {
    await runPlaywright(['--ui']);
}

async function main(): Promise<void> {
    if (!isDirectory(TESTS_DIR)) {
        console.error('\nNo se encontro la carpeta tests en la raiz del proyecto.');
        console.error('Ejecuta este menu desde la raiz donde estan package.json y tests/.\n');
        process.exit(1);
    }

    while (true) {
        const option = await select<'explore' | 'search-test' | 'search-file' | 'grep' | 'ui' | 'exit'>({
            message: 'ERP2 AUTO - TEST RUNNER',
            choices: [
                {name: '📁 Explorar modulos / carpetas / archivos / tests', value: 'explore'},
                {name: '🔍 Buscar test especifico por nombre o tag', value: 'search-test'},
                {name: '🔍 Buscar archivo .spec.ts', value: 'search-file'},
                {name: ' ⚡Ejecutar grep manual', value: 'grep'},
                {name: '🔓 Abrir Playwright UI', value: 'ui'},
                {name: '⏪ Salir', value: 'exit'},
            ],
        });

        if (option === 'explore') {
            await exploreDirectory(TESTS_DIR);
        }

        if (option === 'search-test') {
            await searchGlobalTest();
        }

        if (option === 'search-file') {
            await searchGlobalFile();
        }

        if (option === 'grep') {
            await runManualGrep();
        }

        if (option === 'ui') {
            await runPlaywrightUi();
        }

        if (option === 'exit') {
            killCurrentChild();
            console.log('\nSaliendo...\n');
            process.exit(0);
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
    killCurrentChild();

    if (isExitPromptError(error)) {
        console.log('\nMenú cancelado por el usuario.\n');
        process.exit(130);
    }

    console.error('\nError en el menú:\n');
    console.error(error);
    process.exit(1);
});
