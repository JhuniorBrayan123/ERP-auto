export type ProjectKey = 'Emisiones' | 'Logistica';

export interface ProjectContext {
    key: ProjectKey;
    projectFlag: string | null;
    testDir: string;
    outputDir: string;
    isRunAll: boolean;
}

export type EntryType = 'folder' | 'file';

export interface ExplorerEntry {
    name: string;
    path: string;
    type: EntryType;
}

export interface TestCase {
    title: string;
    filePath: string;
    tags?: string[];
}

export type RunAllMode = 'Sequential' | 'Parallel' | 'Dual' | 'Failed';

export type ExplorerSelection =
    | ExplorerEntry
    | { type: 'run-current-folder'; path: string }
    | { type: 'select-multiple'; path: string }
    | { type: 'back' };

export interface ModuleStats {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    errors: number;
}

export interface SubmoduleStat {
    name: string;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    errors: number;
}

export interface ModuleReportItem {
    name: string;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    errors: number;
    submodules: SubmoduleStat[];
}
