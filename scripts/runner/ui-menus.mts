import fs from 'node:fs';
import path from 'node:path';
import { select } from '@inquirer/prompts';
import type { ProjectKey } from './types.mjs';
import { PROJECT_CONFIG, getProjectContext, ensureOutputDirs } from './config.mjs';
import { spawnSuite } from './runner.mjs';
import { askRunOptions } from './setup-manager.mjs';
import { generateModuleReport } from './module-report.mjs';

const { getFailedTests } = await import('../analyze-results.js');

async function runAllSequential(): Promise<void> {
    await askRunOptions();

    const pvOutput = PROJECT_CONFIG.Emisiones.outputDir;
    const logOutput = PROJECT_CONFIG.Logistica.outputDir;

    const pvArgs = ['--project', 'PuntoVenta', '--output', pvOutput];
    const logArgs = ['--project', 'Logistica', '--output', logOutput];

    const pvEnv: NodeJS.ProcessEnv = {
        ...process.env,
        PW_REPORT_OUTPUT: `${pvOutput}/results.json`,
        PW_JUNIT_OUTPUT: `${pvOutput}/junit.xml`,
        PW_HTML_OUTPUT: 'playwright-report/puntoventa',
    };
    const logEnv: NodeJS.ProcessEnv = {
        ...process.env,
        PW_REPORT_OUTPUT: `${logOutput}/results.json`,
        PW_JUNIT_OUTPUT: `${logOutput}/junit.xml`,
        PW_HTML_OUTPUT: 'playwright-report/logistica',
    };

    ensureOutputDirs(pvOutput);
    ensureOutputDirs(logOutput);
    ensureOutputDirs('playwright-report/puntoventa');
    ensureOutputDirs('playwright-report/logistica');

    console.log('\n=== Ejecutando Suite: Emisiones ===\n');
    const pvResult = await spawnSuite(pvArgs, pvEnv, '[EMI]');

    console.log('\n=== Ejecutando Suite: Logistica ===\n');
    const logResult = await spawnSuite(logArgs, logEnv, '[LOG]');

    console.log('\n=== Run All Summary ===');
    console.log(`Emisiones: exit code ${pvResult.code}`);
    console.log(`Logistica:  exit code ${logResult.code}`);
    console.log('=======================\n');

    const outputDirs = [pvOutput, logOutput].filter(d => d);
    generateModuleReport({ outputDirs, runPaths: [] });
}

async function runAllParallel(): Promise<void> {
    await askRunOptions();

    const pvOutput = PROJECT_CONFIG.Emisiones.outputDir;
    const logOutput = PROJECT_CONFIG.Logistica.outputDir;

    const pvArgs = ['--project', 'PuntoVenta', '--output', pvOutput];
    const logArgs = ['--project', 'Logistica', '--output', logOutput];

    const pvEnv: NodeJS.ProcessEnv = {
        ...process.env,
        PW_REPORT_OUTPUT: `${pvOutput}/results.json`,
        PW_JUNIT_OUTPUT: `${pvOutput}/junit.xml`,
        PW_HTML_OUTPUT: 'playwright-report/puntoventa',
    };
    const logEnv: NodeJS.ProcessEnv = {
        ...process.env,
        PW_REPORT_OUTPUT: `${logOutput}/results.json`,
        PW_JUNIT_OUTPUT: `${logOutput}/junit.xml`,
        PW_HTML_OUTPUT: 'playwright-report/logistica',
    };

    ensureOutputDirs(pvOutput);
    ensureOutputDirs(logOutput);
    ensureOutputDirs('playwright-report/puntoventa');
    ensureOutputDirs('playwright-report/logistica');

    console.log('\n=== Ejecutando Emisiones + Logistica en paralelo ===\n');
    console.log('NOTA: El output se mezclará porque ambos procesos comparten la consola.\n');

    const [pvResult, logResult] = await Promise.all([
        spawnSuite(pvArgs, pvEnv, '[EMI]'),
        spawnSuite(logArgs, logEnv, '[LOG]'),
    ]);

    console.log('\n=== Run All Summary ===');
    console.log(`Emisiones: exit code ${pvResult.code}`);
    console.log(`Logistica:  exit code ${logResult.code}`);
    console.log('=======================\n');

    const outputDirs = [pvOutput, logOutput].filter(d => d);
    generateModuleReport({ outputDirs, runPaths: [] });
}

async function runAllDualTerminal(): Promise<void> {
    const pvOutput = PROJECT_CONFIG.Emisiones.outputDir;
    const logOutput = PROJECT_CONFIG.Logistica.outputDir;

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Ejecutar en DOS TERMINALES separadas');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Una sola consola no puede mostrar dos streams de output');
    console.log('simultáneamente sin mezclarlos. Para ver ambos proyectos');
    console.log('en paralelo con output limpio, abrí dos terminales:\n');
    console.log('┌─ Terminal 1 (Emisiones) ───────────────────────────┐');
    console.log(`│  npx playwright test --project PuntoVenta          │`);
    console.log(`│    --output ${(pvOutput + ' '.repeat(38)).slice(0, 38)}│`);
    console.log('└────────────────────────────────────────────────────┘\n');
    console.log('┌─ Terminal 2 (Logistica) ───────────────────────────┐');
    console.log(`│  npx playwright test --project Logistica           │`);
    console.log(`│    --output ${(logOutput + ' '.repeat(38)).slice(0, 38)}│`);
    console.log('└────────────────────────────────────────────────────┘\n');
    console.log('Los reportes se guardarán separados automáticamente.');
    console.log('═══════════════════════════════════════════════════════\n');
}

async function runFailedTests(): Promise<void> {
    const failedGroups = getFailedTests();

    if (failedGroups.length === 0) {
        const pvPath = path.join(PROJECT_CONFIG.Emisiones.outputDir, 'results.json');
        const logPath = path.join(PROJECT_CONFIG.Logistica.outputDir, 'results.json');
        const pvExists = fs.existsSync(pvPath);
        const logExists = fs.existsSync(logPath);

        if (!pvExists && !logExists) {
            console.log('\nNo se encontró results.json. Ejecuta primero Run All o Run Project.\n');
        } else {
            console.log('\nNo se encontraron tests fallidos para re-ejecutar.\n');
        }
        return;
    }

    const outputDirs: string[] = [];

    for (const group of failedGroups) {
        const { escapeGrep } = await import('./filesystem.mjs');
        const grepPattern = group.titles.map((t: string) => escapeGrep(t)).join('|');
        const projectKey = group.project as ProjectKey;
        const config = PROJECT_CONFIG[projectKey];
        const outputDir = config.outputDir;

        console.log(`\n=== Re-ejecutando ${group.titles.length} test(s) fallidos en ${group.project} ===\n`);

        const args = ['--project', group.project, '--grep', grepPattern, '--output', outputDir];

        const childEnv: NodeJS.ProcessEnv = {
            ...process.env,
            PW_REPORT_OUTPUT: `${outputDir}/results.json`,
            PW_JUNIT_OUTPUT: `${outputDir}/junit.xml`,
            PW_HTML_OUTPUT: `playwright-report/${projectKey.toLowerCase()}`,
        };

        ensureOutputDirs(outputDir);
        ensureOutputDirs(`playwright-report/${projectKey.toLowerCase()}`);

        const result = await spawnSuite(args, childEnv, `[${group.project}]`);

        console.log(`\n${group.project} — exit code: ${result.code}\n`);
        outputDirs.push(outputDir);
    }

    if (outputDirs.length > 0) {
        generateModuleReport({ outputDirs, runPaths: [] });
    }
}

async function runProjectSubmenu(projectKey: ProjectKey): Promise<void> {
    const projectContext = getProjectContext(projectKey);
    const projectTestDir = projectContext.testDir;
    const projectLabel = projectKey;

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

        if (option === 'back') break;

        if (option === 'explore') {
            const { exploreDirectory } = await import('./ui-explorer.mjs');
            await exploreDirectory(projectTestDir, projectContext, projectTestDir);
        }

        if (option === 'search-test') {
            const { searchGlobalTest } = await import('./ui-search.mjs');
            await searchGlobalTest(projectContext);
        }

        if (option === 'search-file') {
            const { searchGlobalFile } = await import('./ui-search.mjs');
            await searchGlobalFile(projectContext);
        }

        if (option === 'grep') {
            const { runManualGrep } = await import('./ui-search.mjs');
            await runManualGrep(projectContext);
        }

        if (option === 'ui') {
            const { runPlaywrightUi } = await import('./ui-search.mjs');
            await runPlaywrightUi(projectContext);
        }
    }
}

export async function selectProject(): Promise<'Emisiones' | 'Logistica' | 'RunAllSequential' | 'RunAllParallel' | 'RunAllDual' | 'RunAllFailed' | 'exit'> {
    const choice = await select<'Emisiones' | 'Logistica' | 'RunAllSequential' | 'RunAllParallel' | 'RunAllDual' | 'RunAllFailed' | 'exit'>({
        message: 'ERP2 AUTO - TEST RUNNER — Selecciona proyecto:',
        choices: [
            { name: '1. Emisiones', value: 'Emisiones' },
            { name: '2. Logistica', value: 'Logistica' },
            { name: '3. Run All (Secuencial)', value: 'RunAllSequential' },
            { name: '4. Run All (Paralelo: EMI + LOG)', value: 'RunAllParallel' },
            { name: '5. Run All (Dos terminales)', value: 'RunAllDual' },
            { name: '6. 🔄 Re-ejecutar tests fallidos', value: 'RunAllFailed' },
            { name: '7. Salir', value: 'exit' },
        ],
    });
    return choice;
}

export async function handleMenuChoice(
    projectChoice: 'Emisiones' | 'Logistica' | 'RunAllSequential' | 'RunAllParallel' | 'RunAllDual' | 'RunAllFailed' | 'exit',
): Promise<boolean> {
    if (projectChoice === 'exit') return false;

    if (projectChoice === 'RunAllSequential') {
        await runAllSequential();
        return true;
    }

    if (projectChoice === 'RunAllParallel') {
        await runAllParallel();
        return true;
    }

    if (projectChoice === 'RunAllDual') {
        await runAllDualTerminal();
        return true;
    }

    if (projectChoice === 'RunAllFailed') {
        await runFailedTests();
        return true;
    }

    await runProjectSubmenu(projectChoice);
    return true;
}
