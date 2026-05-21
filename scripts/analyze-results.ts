import fs from "node:fs";
import path from "node:path";

// ── Types ───────────────────────────────────────────────────────────────

export interface FailedTestGroup {
    project: string;
    titles: string[];
}

// ── Constants ───────────────────────────────────────────────────────────

const ROOT_DIR = process.cwd();

const PROJECT_OUTPUT_DIRS: Record<string, string> = {
    PuntoVenta: path.join(ROOT_DIR, "test-results", "puntoventa"),
    Logistica: path.join(ROOT_DIR, "test-results", "logistica"),
};

// ── parseResultsFile ────────────────────────────────────────────────────

/**
 * Parse a single results.json file and extract titles of failed / timedOut tests.
 * Returns [] if the file does not exist, is malformed, or has no failures.
 */
export function parseResultsFile(filePath: string): string[] {
    let raw: string;

    try {
        raw = fs.readFileSync(filePath, "utf-8");
    } catch {
        return [];
    }

    let report: any;

    try {
        report = JSON.parse(raw);
    } catch {
        return [];
    }

    if (!report || !Array.isArray(report.suites)) {
        return [];
    }

    const titles: string[] = [];
    walkSuites(report.suites, titles);
    return titles;
}

function walkSuites(suites: any[], titles: string[]): void {
    for (const suite of suites) {
        if (Array.isArray(suite.specs)) {
            for (const spec of suite.specs) {
                if (isFailedOrTimedOut(spec)) {
                    titles.push(spec.title);
                }
            }
        }

        if (Array.isArray(suite.suites)) {
            walkSuites(suite.suites, titles);
        }
    }
}

function isFailedOrTimedOut(spec: any): boolean {
    if (!Array.isArray(spec.tests)) {
        return false;
    }

    return spec.tests.some(
        (t: any) =>
            t &&
            (t.status === "failed" || t.status === "timedOut"),
    );
}

// ── getFailedTests ──────────────────────────────────────────────────────

/**
 * Scan all known output directories for results.json files,
 * parse each, and return groups of failed tests per project.
 * Returns [] if no results files exist or no failures found.
 */
export function getFailedTests(): FailedTestGroup[] {
    const groups: FailedTestGroup[] = [];

    for (const [project, outputDir] of Object.entries(PROJECT_OUTPUT_DIRS)) {
        const resultsPath = path.join(outputDir, "results.json");
        const titles = parseResultsFile(resultsPath);

        if (titles.length > 0) {
            groups.push({ project, titles });
        }
    }

    return groups;
}
