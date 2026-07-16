import fs from 'node:fs';
import path from 'node:path';
import type { ModuleReportItem, SubmoduleStat } from './types.mjs';
import { TOP_LEVEL_MODULES } from './config.mjs';
import { toRelative, resolveModuleAndSubmodule } from './filesystem.mjs';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

interface ParsedTest {
    title: string;
    status: string;
    filePath: string;
    projectName: string;
}

/**
 * Lee results.json y extrae todos los tests con su estado y ruta de archivo.
 */
function parseResultsJson(filePath: string): ParsedTest[] {
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const report = JSON.parse(raw);
        const tests: ParsedTest[] = [];
        walkSuites(report.suites ?? [], '', tests);
        return tests;
    } catch {
        return [];
    }
}

function walkSuites(suites: any[], _parentTitle: string, tests: ParsedTest[]): void {
    for (const suite of suites) {
        if (Array.isArray(suite.specs)) {
            for (const spec of suite.specs) {
                const filePath = spec.title || '';
                if (Array.isArray(spec.tests)) {
                    for (const t of spec.tests) {
                        const status = t.status || 'unknown';
                        let mappedStatus: string;
                        if (status === 'expected' || status === 'flaky') {
                            mappedStatus = 'passed';
                        } else if (status === 'unexpected') {
                            mappedStatus = 'failed';
                        } else if (status === 'skipped') {
                            mappedStatus = 'skipped';
                        } else if (status === 'timedOut') {
                            mappedStatus = 'failed';
                        } else {
                            mappedStatus = status;
                        }
                        tests.push({
                            title: spec.title || '',
                            status: mappedStatus,
                            filePath,
                            projectName: t.projectName || 'unknown',
                        });
                    }
                }
            }
        }

        if (Array.isArray(suite.suites)) {
            walkSuites(suite.suites, '', tests);
        }
    }
}

/**
 * Agrupa tests por módulo y submódulo a partir del filePath del spec.
 */
function groupByModule(tests: ParsedTest[]): Map<string, Map<string, SubmoduleStat>> {
    const modules = new Map<string, Map<string, SubmoduleStat>>();

    for (const test of tests) {
        const { module: mod, submodule } = resolveModuleAndSubmodule(test.filePath);
        const subKey = submodule || '__root__';

        if (!modules.has(mod)) {
            modules.set(mod, new Map());
        }
        const subs = modules.get(mod)!;
        if (!subs.has(subKey)) {
            subs.set(subKey, { name: subKey === '__root__' ? mod : subKey, total: 0, passed: 0, failed: 0, skipped: 0, errors: 0 });
        }
        const stat = subs.get(subKey)!;
        stat.total++;
        if (test.status === 'passed') stat.passed++;
        else if (test.status === 'failed') stat.failed++;
        else if (test.status === 'skipped') stat.skipped++;
        else stat.errors++;
    }

    return modules;
}

/**
 * Filtra módulos por los paths ejecutados. Si runPaths está vacío, retorna todos
 * pero sin submódulos (Run All mode).
 */
function filterModulesByPaths(
    modules: Map<string, Map<string, SubmoduleStat>>,
    runPaths: string[],
): Map<string, Map<string, SubmoduleStat>> {
    if (runPaths.length === 0) {
        // Run All mode — return all modules but only keep root-level stat
        const flat = new Map<string, Map<string, SubmoduleStat>>();
        for (const [mod, subs] of modules) {
            let total = 0, passed = 0, failed = 0, skipped = 0, errors = 0;
            for (const [, stat] of subs) {
                total += stat.total;
                passed += stat.passed;
                failed += stat.failed;
                skipped += stat.skipped;
                errors += stat.errors;
            }
            const rootMap = new Map<string, SubmoduleStat>();
            rootMap.set('__root__', { name: mod, total, passed, failed, skipped, errors });
            flat.set(mod, rootMap);
        }
        return flat;
    }

    const relevantMods = new Set<string>();
    const relevantSubs = new Map<string, Set<string>>();

    for (const p of runPaths) {
        const { module: mod, submodule } = resolveModuleAndSubmodule(p);
        if (mod && mod !== 'unknown') {
            relevantMods.add(mod);
            if (submodule) {
                if (!relevantSubs.has(mod)) relevantSubs.set(mod, new Set());
                relevantSubs.get(mod)!.add(submodule);
            }
        }
    }

    // If runPaths target specific files, resolve their parent dirs
    for (const p of runPaths) {
        const rel = toRelative(p);
        const parts = rel.split('/');
        const testsIdx = parts.indexOf('tests');
        if (testsIdx >= 0 && parts.length >= testsIdx + 3) {
            const mod = parts[testsIdx + 2];
            if (mod === 'Facturacion' && parts.length >= testsIdx + 4) {
                const sub = parts[testsIdx + 3];
                relevantMods.add('Facturacion');
                if (!relevantSubs.has('Facturacion')) relevantSubs.set('Facturacion', new Set());
                relevantSubs.get('Facturacion')!.add(sub);
            } else if (['PuntoVenta', 'Busqueda', 'CierreCaja'].includes(mod)) {
                relevantMods.add(mod);
                if (parts.length >= testsIdx + 4) {
                    const sub = parts[testsIdx + 3];
                    if (!relevantSubs.has(mod)) relevantSubs.set(mod, new Set());
                    relevantSubs.get(mod)!.add(sub);
                }
            } else {
                relevantMods.add(mod);
            }
        }
    }

    const filtered = new Map<string, Map<string, SubmoduleStat>>();
    for (const [mod, subs] of modules) {
        if (!relevantMods.has(mod)) continue;
        const relevantSubSet = relevantSubs.get(mod);
        if (relevantSubSet && relevantSubSet.size > 0) {
            const filteredSubs = new Map<string, SubmoduleStat>();
            for (const [key, stat] of subs) {
                if (relevantSubSet.has(key)) {
                    filteredSubs.set(key, stat);
                }
            }
            if (filteredSubs.size > 0) {
                filtered.set(mod, filteredSubs);
            }
        } else {
            // Module selected but no specific sub — show all subs
            filtered.set(mod, subs);
        }
    }
    return filtered;
}

function buildReportItems(grouped: Map<string, Map<string, SubmoduleStat>>): ModuleReportItem[] {
    const items: ModuleReportItem[] = [];

    for (const [mod, subs] of grouped) {
        let total = 0, passed = 0, failed = 0, skipped = 0, errors = 0;
        const submodules: SubmoduleStat[] = [];

        for (const [, stat] of subs) {
            total += stat.total;
            passed += stat.passed;
            failed += stat.failed;
            skipped += stat.skipped;
            errors += stat.errors;
            if (stat.name !== mod || subs.size > 1) {
                submodules.push(stat);
            }
        }

        submodules.sort((a, b) => a.name.localeCompare(b.name, 'es'));

        items.push({ name: mod, total, passed, failed, skipped, errors, submodules });
    }

    items.sort((a, b) => {
        const aIdx = TOP_LEVEL_MODULES.indexOf(a.name);
        const bIdx = TOP_LEVEL_MODULES.indexOf(b.name);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return a.name.localeCompare(b.name, 'es');
    });

    return items;
}

function padRight(s: string, len: number): string {
    const visualLen = s.replace(/\x1b\[[0-9;]*m/g, '').length;
    return s + ' '.repeat(Math.max(0, len - visualLen));
}

function formatNum(n: number, width: number): string {
    return String(n).padStart(width);
}

export function generateModuleReport(options: { outputDirs: string[]; runPaths: string[] }): void {
    const { outputDirs, runPaths } = options;

    if (outputDirs.length === 0) return;

    const allTests: ParsedTest[] = [];
    for (const dir of outputDirs) {
        const resultsPath = path.join(dir, 'results.json');
        const tests = parseResultsJson(resultsPath);
        allTests.push(...tests);
    }

    if (allTests.length === 0) {
        console.log(`${YELLOW}[reporte] No se encontraron resultados para generar reporte.${RESET}\n`);
        return;
    }

    const grouped = groupByModule(allTests);
    const filtered = filterModulesByPaths(grouped, runPaths);
    const items = buildReportItems(filtered);

    if (items.length === 0) {
        console.log(`${YELLOW}[reporte] No se encontraron módulos para reportar.${RESET}\n`);
        return;
    }

    const showSubs = runPaths.length > 0;

    // Print report header
    const lineLen = 62;
    const sep = '═'.repeat(lineLen);
    console.log(`${CYAN}${sep}${RESET}`);
    console.log(`${CYAN}${BOLD}  REPORTE POR MÓDULO${RESET}`);
    console.log(`${CYAN}${sep}${RESET}`);

    let grandTotal = 0, grandPassed = 0, grandFailed = 0, grandSkipped = 0, grandErrors = 0;

    for (const item of items) {
        const statusColor = item.failed > 0 || item.errors > 0 ? RED : GREEN;
        const modLine = ` ${statusColor}📁 ${item.name}${RESET}` +
            ` ${formatNum(item.total, 5)}  ${GREEN}✅ ${formatNum(item.passed, 4)}${RESET}  ${RED}❌ ${formatNum(item.failed, 4)}${RESET}` +
            (item.skipped > 0 ? `  ${YELLOW}⏭ ${item.skipped}${RESET}` : '') +
            (item.errors > 0 ? `  ${YELLOW}⚠ ${item.errors}${RESET}` : '');
        console.log(modLine);

        if (showSubs && item.submodules.length > 0) {
            for (const sub of item.submodules) {
                const subColor = sub.failed > 0 || sub.errors > 0 ? RED : GREEN;
                console.log(`   ${subColor}📂 ${padRight(sub.name, 22)}${RESET}` +
                    ` ${formatNum(sub.total, 3)}   ${GREEN}${formatNum(sub.passed, 3)}${RESET}   ${RED}${formatNum(sub.failed, 3)}${RESET}`);
            }
        }

        grandTotal += item.total;
        grandPassed += item.passed;
        grandFailed += item.failed;
        grandSkipped += item.skipped;
        grandErrors += item.errors;
    }

    const dashLine = '─'.repeat(lineLen);
    console.log(` ${dashLine}`);
    const totalLine = ` ${CYAN}📦 TOTAL${RESET}` +
        ` ${formatNum(grandTotal, 5)}  ${GREEN}✅ ${formatNum(grandPassed, 4)}${RESET}  ${RED}❌ ${formatNum(grandFailed, 4)}${RESET}` +
        (grandSkipped > 0 ? `  ${YELLOW}⏭ ${grandSkipped}${RESET}` : '') +
        (grandErrors > 0 ? `  ${YELLOW}⚠ ${grandErrors}${RESET}` : '');
    console.log(totalLine);
    console.log(`${CYAN}${sep}${RESET}`);
    console.log('');
}
