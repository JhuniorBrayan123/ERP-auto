import path from 'node:path';
import fs from 'node:fs';
import type { ProjectKey, ProjectContext } from './types.mjs';

export const ROOT_DIR = process.cwd();
export const TESTS_DIR = path.join(ROOT_DIR, 'tests');

export const PROJECT_CONFIG: Record<ProjectKey, { projectFlag: string | null; testDir: string; outputDir: string }> = {
    Emisiones: {
        projectFlag: 'PuntoVenta',
        testDir: path.join(TESTS_DIR, 'Emisiones'),
        outputDir: 'test-results/puntoventa',
    },
    Logistica: {
        projectFlag: 'Logistica',
        testDir: path.join(TESTS_DIR, 'Logistica'),
        outputDir: 'test-results/logistica',
    },
};

export function getProjectContext(key: ProjectKey, isRunAll = false): ProjectContext {
    const config = PROJECT_CONFIG[key];
    return {
        key,
        projectFlag: config.projectFlag,
        testDir: config.testDir,
        outputDir: config.outputDir,
        isRunAll,
    };
}

export function ensureOutputDirs(outputDir: string): void {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
}

export const TOP_LEVEL_MODULES: string[] = [
    'PuntoVenta',
    'Facturacion',
    'Busqueda',
    'CierreCaja',
    'Logistica',
];
