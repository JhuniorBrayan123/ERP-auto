import { select, checkbox } from '@inquirer/prompts';
import type { ProjectContext, ExplorerEntry, ExplorerSelection, TestCase } from './types.mjs';
import { listEntries, toRelative, isSpecFile, escapeGrep } from './filesystem.mjs';
import { runPlaywright } from './runner.mjs';
import { askRunOptions } from './setup-manager.mjs';
import { generateModuleReport } from './module-report.mjs';

async function runFolder(folderPath: string, projectContext: ProjectContext): Promise<void> {
    const extraArgs = await askRunOptions(projectContext.key);
    const outputDirs = await runPlaywright([toRelative(folderPath), ...extraArgs], projectContext);
    generateModuleReport({ outputDirs, runPaths: [folderPath] });
}

async function runMultiplePaths(paths: string[], projectContext: ProjectContext): Promise<void> {
    if (!paths.length) {
        console.log('\nNo seleccionaste ningun elemento.\n');
        return;
    }

    const extraArgs = await askRunOptions(projectContext.key);
    const outputDirs = await runPlaywright([...paths.map(toRelative), ...extraArgs], projectContext);
    generateModuleReport({ outputDirs, runPaths: paths });
}

async function selectMultipleFromDirectory(currentDir: string, projectContext: ProjectContext): Promise<void> {
    const entries = listEntries(currentDir);

    if (!entries.length) {
        console.log('\nEsta carpeta no tiene subcarpetas ni archivos .spec.ts.\n');
        return;
    }

    const selections = await checkbox<ExplorerEntry | 'back'>({
        message: `Selecciona carpetas o archivos de ${toRelative(currentDir) || 'tests'}:\n` +
            'Usa ESPACIO para marcar/desmarcar y ENTER para confirmar.',
        pageSize: 20,
        choices: [
            ...entries.map((entry) => ({
                name: entry.type === 'folder' ? `📁 ${entry.name}` : `📄 ${entry.name}`,
                value: entry as ExplorerEntry | 'back',
            })),
            { name: '⬅ Volver', value: 'back' as const },
        ],
    });

    if (!selections.length || selections.includes('back')) return;

    const selectedEntries = selections.filter((s): s is ExplorerEntry => s !== 'back');
    await runMultiplePaths(selectedEntries.map((entry) => entry.path), projectContext);
}

async function runSingleTestFromFile(filePath: string, projectContext: ProjectContext): Promise<void> {
    const { extractTestsFromFile } = await import('./filesystem.mjs');
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

    const extraArgs = await askRunOptions(projectContext.key);
    const outputDirs = await runPlaywright([
        toRelative(filePath),
        '--grep',
        escapeGrep(selectedTest.title),
        ...extraArgs,
    ], projectContext);
    generateModuleReport({ outputDirs, runPaths: [filePath] });
}

async function runMultipleTestsFromFile(filePath: string, projectContext: ProjectContext): Promise<void> {
    const { extractTestsFromFile } = await import('./filesystem.mjs');
    const tests = extractTestsFromFile(filePath);

    if (!tests.length) {
        console.log('\nNo se encontraron tests en este archivo.\n');
        return;
    }

    const selections = await checkbox<TestCase | 'back'>({
        message: `Selecciona los tests que quieres ejecutar:\n` +
            'Usa ESPACIO para marcar/desmarcar y ENTER para confirmar.',
        pageSize: 20,
        choices: [
            ...tests.map((testCase, index) => ({
                name: `${index + 1}. ${testCase.title}`,
                value: testCase as TestCase | 'back',
            })),
            { name: '⬅ Volver', value: 'back' as const },
        ],
    });

    if (!selections.length || selections.includes('back')) return;

    const selectedTests = selections.filter((s): s is TestCase => s !== 'back');
    const grepRegex = selectedTests.map((testCase) => escapeGrep(testCase.title)).join('|');

    const extraArgs = await askRunOptions(projectContext.key);
    const outputDirs = await runPlaywright([
        toRelative(filePath),
        '--grep',
        grepRegex,
        ...extraArgs,
    ], projectContext);
    generateModuleReport({ outputDirs, runPaths: [filePath] });
}

export async function runFile(filePath: string, projectContext: ProjectContext): Promise<void> {
    if (!isSpecFile(filePath)) {
        console.log('\nEl archivo seleccionado no es un .spec.ts valido.\n');
        return;
    }

    const { extractTestsFromFile } = await import('./filesystem.mjs');
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
            const extraArgs = await askRunOptions(projectContext.key);
            const outputDirs = await runPlaywright([toRelative(filePath), ...extraArgs], projectContext);
            generateModuleReport({ outputDirs, runPaths: [filePath] });
        }

        if (action === 'run-single-test') {
            await runSingleTestFromFile(filePath, projectContext);
        }

        if (action === 'run-multiple-tests') {
            await runMultipleTestsFromFile(filePath, projectContext);
        }
    }
}

export async function exploreDirectory(
    currentDir: string,
    projectContext: ProjectContext,
    projectTestDir: string,
): Promise<void> {
    while (true) {
        const entries = listEntries(currentDir);
        const currentRelative = toRelative(currentDir) || 'tests';

        const choices = [
            {
                name: '▶ Ejecutar todos los tests de esta carpeta',
                value: { type: 'run-current-folder' as const, path: currentDir },
            },
            {
                name: '☐ Seleccionar varios de esta carpeta',
                value: { type: 'select-multiple' as const, path: currentDir },
                disabled: entries.length === 0 ? 'No hay elementos para seleccionar' : false,
            },
            ...entries.map((entry) => ({
                name: entry.type === 'folder' ? `📁 ${entry.name}` : `⚡  ${entry.name}`,
                value: entry as ExplorerSelection,
            })),
            {
                name: currentDir === projectTestDir ? 'Volver al menu principal' : '⬆ Subir carpeta',
                value: { type: 'back' as const },
            },
        ];

        const selected = await select<ExplorerSelection>({
            message: `Explorador: ${currentRelative}`,
            pageSize: 20,
            choices,
        });

        if (selected.type === 'back') return;

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
