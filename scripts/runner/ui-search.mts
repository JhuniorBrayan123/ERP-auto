import { input, select } from '@inquirer/prompts';
import type { ProjectContext, TestCase } from './types.mjs';
import { walkSpecFiles, toRelative, tokenMatch, getFuseInstance, escapeGrep, extractTestsFromFile } from './filesystem.mjs';
import { runPlaywright } from './runner.mjs';
import { askRunOptions } from './setup-manager.mjs';
import { generateModuleReport } from './module-report.mjs';
import { runFile } from './ui-explorer.mjs';

export async function searchGlobalTest(projectContext: ProjectContext): Promise<void> {
    const query = await input({
        message: 'Buscar test por nombre o tag, ejemplo MS-1, ingreso, @PV-1.1:',
    });

    if (!query.trim()) return;

    const allTests = walkSpecFiles(projectContext.testDir).flatMap(extractTestsFromFile);
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
            { name: '⬅ Volver al menu principal', value: null },
        ],
    });

    if (!selectedTest) return;

    const extraArgs = await askRunOptions(projectContext.key);
    const outputDirs = await runPlaywright([
        toRelative(selectedTest.filePath),
        '--grep',
        escapeGrep(selectedTest.title),
        ...extraArgs,
    ], projectContext);
    generateModuleReport({ outputDirs, runPaths: [selectedTest.filePath] });
}

export async function searchGlobalFile(projectContext: ProjectContext): Promise<void> {
    const query = await input({
        message: 'Buscar archivo .spec.ts, ejemplo MS-1, clonacion, boleta:',
    });

    if (!query.trim()) return;

    const files = walkSpecFiles(projectContext.testDir);
    const trimmed = query.trim();

    const tokenFileMatches = files.filter((filePath) =>
        tokenMatch(trimmed, toRelative(filePath)),
    );

    let matches: string[];

    if (tokenFileMatches.length > 0) {
        matches = tokenFileMatches;
    } else {
        console.log('[Búsqueda] Sin resultados exactos — probando fuzzy search...');
        const fileTestCases: TestCase[] = files.map(f => ({ title: toRelative(f), filePath: f }));
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
            { name: '⬅ Volver al menu principal', value: null },
        ],
    });

    if (!selectedFile) return;

    await runFile(selectedFile, projectContext);
}

export async function runManualGrep(projectContext: ProjectContext): Promise<void> {
    const grep = await input({
        message: 'Ingresa tag o texto para --grep, ejemplo @logistica, @MS-1, boleta:',
    });

    if (!grep.trim()) return;

    const extraArgs = await askRunOptions(projectContext.key);
    const args = ['--grep', grep.trim(), ...extraArgs];
    const outputDirs = await runPlaywright(args, projectContext);
    generateModuleReport({ outputDirs, runPaths: [] });
}

export async function runPlaywrightUi(projectContext: ProjectContext): Promise<void> {
    await askRunOptions(projectContext.key);
    await runPlaywright(['--ui'], projectContext);
}
