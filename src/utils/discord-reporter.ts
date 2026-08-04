import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import type {FullResult, Reporter, TestCase, TestResult} from '@playwright/test/reporter';
import {discordEnv, normalizeMention} from '../../config/env';
import {getEnvironmentLabel} from './environment-label';
import {detectFailureCategory, parseFunctionalMeta} from './functional-error';

export const DISCORD_MAX_LENGTH = 2000;

export interface QaFailure {
    caseName: string;
    failedStep: string;
    userMessage: string;
    failureCategory: string;
}

export interface DiscordPartial {
    project: string;
    module: string;
    started: number;
    passed: number;
    failed: number;
    errors: number;
    skipped: number;
        durationMs: number;
    qaFailures: QaFailure[];
    htmlLink: string;
}

export interface ConsolidatedPayload {
    environment: string;
    tester: string;
    startedAt: string;
    durationMs: number;
    modules: DiscordPartial[];
    total: {passed: number; failed: number; errors: number; skipped: number};
    failures: QaFailure[];

    htmlLinks: string[];
    missing: string[];
}

/**
 * Normaliza un segmento de carpeta a PascalCase: separa por '-'/'_',
 * capitaliza la primera letra de cada token y los une sin separador.
 * Ej: 'notas-debito' → 'NotasDebito', 'PV-01_emision-stock-datos-adicionales' → 'PV01EmisionStockDatosAdicionales'.
 */
function pascalCaseFolder(name: string): string {
    return name
        .split(/[-_]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

/**
 * Raíces de carpetas de tests: cada entrada define el prefijo físico y cómo
 * se muestra como proyecto. Orden importa (más específico primero).
 */
const MODULE_BASES: ReadonlyArray<{prefix: string; projectPrefix: string}> = [
    {prefix: 'tests/Emisiones/', projectPrefix: ''},
    {prefix: 'tests/Logistica/', projectPrefix: 'Logistica'},
    {prefix: 'tests/ClientesProveedores/', projectPrefix: 'Clientes'},
];

/**
 * Deriva el módulo (jerarquía de carpetas real) desde la ruta del spec.
 *
 * - Toma la ruta relativa desde la raíz de tests (tests/Emisiones,
 *   tests/Logistica, tests/ClientesProveedores), descarta el nombre del archivo,
 *   normaliza cada segmento a PascalCase y los une con '/'.
 * - La primera carpeta bajo tests/Emisiones ES el proyecto (PuntoVenta,
 *   Facturacion, Busqueda, CierreCaja), por eso projectPrefix es '' ahí.
 * - Ej: 'tests/Emisiones/PuntoVenta/Boleta/boleta.spec.ts' → 'PuntoVenta/Boleta'
 * - Ej: 'tests/Logistica/Movimientos/movimiento.spec.ts' → 'Logistica/Movimientos'
 * - Ej: 'tests/ClientesProveedores/proveedores/proveedor.spec.ts' → 'Clientes/Proveedores'
 */
export function extractModuleFromFile(file: string): string {
    const f = file.replace(/\\/g, '/');
    for (const {prefix, projectPrefix} of MODULE_BASES) {
        const idx = f.indexOf(prefix);
        if (idx === -1) continue;
        const rest = f.slice(idx + prefix.length);
        const segments = rest.split('/').filter(Boolean);
        const dirs = segments.slice(0, -1);
        const folders = dirs.map(pascalCaseFolder);
        return [projectPrefix, ...folders].filter(Boolean).join('/') || projectPrefix;
    }
    return 'Otros';
}

export function projectKeyFromReportOutput(output: string | undefined): string | undefined {
    if (!output) return undefined;
    const match = output.replace(/\\/g, '/').match(/test-results\/([^/]+)\/results\.json/);
    if (!match) return undefined;
    const dir = match[1].toLowerCase();
    const known: Record<string, string> = {
        puntoventa: 'PuntoVenta',
        facturacion: 'Facturacion',
        logistica: 'Logistica',
        clientes: 'Clientes',
    };
    return known[dir] ?? (dir.charAt(0).toUpperCase() + dir.slice(1));
}

function formatDurationMs(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
        return `${minutes} min ${seconds} sec`;
    }
    return `${seconds} sec`;
}

/**
 * Formatea una fecha ISO como fecha + hora local (es-PE), ej: `04/08/2026, 20:16`.
 * Devuelve 'No disponible' si el valor es inválido o no se informó.
 */
function formatDateTime(iso: string | undefined): string {
    if (!iso) return 'No disponible';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'No disponible';
    return d.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

export function formatDiscordMessage(
    payload: ConsolidatedPayload,
    mentions?: {userId?: string},
): string {
    const hasFailures = payload.total.failed > 0 || payload.total.errors > 0;

    const SEP = '──────────────────────────────────────────────';
    const mentionLine = mentions?.userId ? `${mentions.userId}\n` : '';

    const headerLines = [
        `🤖 **REPORTE DE REGRESIÓN ERP2** — ${payload.environment}`,
        `👤 **Tester:** ${payload.tester || 'No identificado'}`,
        `📅 **Fecha de ejecución:** ${formatDateTime(payload.startedAt)}`,
        `⏱️ **Duración:** ${formatDurationMs(payload.durationMs)}`,
    ];

    // Formato compacto: el texto va pegado a los separadores, sin líneas en blanco.
    const header = `${mentionLine}${SEP}\n${headerLines.join('\n')}\n${SEP}\n`;

    const moduleLines = payload.modules.length
        ? payload.modules.map((m) => {
            const bad = m.failed + m.errors;
            const icon = bad > 0 ? '❌' : '✅';
            let desc = `${m.passed} pasaron`;
            if (m.failed > 0) desc += `, ${m.failed} fallaron`;
            if (m.errors > 0) desc += `, ${m.errors} errores`;
            if (m.skipped > 0) desc += `, ${m.skipped} omitidos`;
            return `${icon} **${m.module}** — ${desc}`;
        })
        : ['➖ _No se ejecutaron pruebas_'];
    const moduleSection = `📋 **RESULTADOS POR MÓDULO**\n${moduleLines.join('\n')}\n${SEP}\n`;

    const state = hasFailures ? '❌ **FALLIDO**' : '✅ **EXITOSO**';
    const total = payload.total;
    const totalCount = total.passed + total.failed + total.errors + total.skipped;
    const parts = [`${total.passed} ✅`];
    if (total.failed > 0) parts.push(`${total.failed} ❌`);
    if (total.errors > 0) parts.push(`${total.errors} ⚠️`);
    if (total.skipped > 0) parts.push(`${total.skipped} ➖`);

    const summarySection =
        `📊 **RESUMEN GLOBAL**\n**Estado:** ${state}\n` +
        `**Total:** ${totalCount} (${parts.join(' | ')})\n`;

    let body = `${header}${moduleSection}${summarySection}`;

    if (hasFailures) {
        body += `📄 Para ver los detalles de los fallos, revisa el reporte HTML local ejecutando \`npx playwright show-report\`.\n${SEP}\n`;
    }

    if (payload.failures.length > 0) {
        body += `❌ **TOP FALLOS**\n`;
        const footerReserve = '… +999999 más'.length;
        let included = 0;
        for (const f of payload.failures) {
            const line =
                `   ${included + 1}. [${f.failureCategory}] ${f.caseName}\n` +
                `      Paso: ${f.failedStep}\n` +
                `      Motivo: ${f.userMessage}\n`;
            if (body.length + line.length > DISCORD_MAX_LENGTH - footerReserve) {
                break;
            }
            body += line;
            included++;
        }
        const remaining = payload.failures.length - included;
        if (remaining > 0) {
            body += `… +${remaining} más`;
        }
    }

    if (body.length > DISCORD_MAX_LENGTH) {
        body = body.slice(0, DISCORD_MAX_LENGTH - 1) + '…';
    }
    return body;
}



export function mergePartials(partials: DiscordPartial[], missing: string[]): ConsolidatedPayload {
    const total = {passed: 0, failed: 0, errors: 0, skipped: 0};
    const failures: QaFailure[] = [];
    const htmlLinks: string[] = [];
    for (const part of partials) {
        total.passed += part.passed;
        total.failed += part.failed;
        total.errors += part.errors;
        total.skipped += part.skipped;
        failures.push(...part.qaFailures);
        if (part.htmlLink) {
            htmlLinks.push(part.htmlLink);
        }
    }
    const started = partials.length > 0 ? Math.min(...partials.map((p) => p.started)) : Date.now();
    const durationMs = partials.reduce((acc, p) => acc + p.durationMs, 0);
    return {
        environment: getEnvironmentLabel(),
        tester: discordEnv.testerName ?? 'No identificado',
        startedAt: new Date(started).toISOString(),
        durationMs,
        modules: partials,
        total,
        failures,

        htmlLinks,
        missing,
    };
}

export async function postToDiscord(
    content: string,
    opts: {webhookUrl: string; dryRun: boolean},
): Promise<void> {
    if (opts.dryRun) {
        console.log(`[discord-reporter] [dry-run] Mensaje listo para Discord (${content.length} chars): ${content.slice(0, 160)}…`);
        return;
    }
    try {
        const response = await fetch(opts.webhookUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({content}),
        });
        if (!response.ok) {
            console.error(`[discord-reporter] Discord respondió ${response.status} ${response.statusText}`);
            return;
        }
        console.log('[discord-reporter] Reporte enviado a Discord exitosamente.');
    } catch (error) {
        console.error('[discord-reporter] Error enviando reporte a Discord:', error);
    }
}

export function loadPartialsFromDisk(
    partialsDir: string,
    expectedProjects: string[],
): {partials: DiscordPartial[]; missing: string[]} {
    const partials: DiscordPartial[] = [];
    const missing: string[] = [];
    for (const project of expectedProjects) {
        const file = path.join(partialsDir, `${project}.json`);
        if (!existsSync(file)) {
            missing.push(project);
            continue;
        }
        try {
            const raw = readFileSync(file, 'utf8');
            const parsed = JSON.parse(raw) as Partial<DiscordPartial>;
            if (
                typeof parsed?.project !== 'string' ||
                typeof parsed?.module !== 'string' ||
                typeof parsed?.passed !== 'number' ||
                typeof parsed?.failed !== 'number' ||
                !Array.isArray(parsed?.qaFailures)
            ) {
                throw new Error('estructura inválida');
            }
            partials.push(parsed as DiscordPartial);
        } catch {
            console.warn(`[discord-reporter] Parcial corrupto o inválido: ${file} — omitido`);
            missing.push(project);
        }
    }
    return {partials, missing};
}

function buildQaFailure(test: TestCase, result: TestResult): QaFailure {
    const rawMessage = result.error?.message ?? '';
    const parsed = parseFunctionalMeta(rawMessage);
    if (parsed) {
        return {
            caseName: parsed.caseName ?? test.title,
            failedStep: parsed.failedStep || 'Paso no identificado',
            userMessage: parsed.userMessage,
            failureCategory: parsed.failureCategory ?? detectFailureCategory(result.error),
        };
    }

    const firstLine = rawMessage.split('\n')[0]?.trim() || 'Error no controlado';
    const isTimeout = result.status === 'timedOut' || firstLine.toLowerCase().includes('timeout');
    return {
        caseName: test.title,
        failedStep: getFailedStep(result),
        userMessage: isTimeout
            ? 'La pantalla no quedó lista para continuar el flujo.'
            : 'Ocurrió un error durante el flujo y no se pudo completar el paso esperado.',
        failureCategory: detectFailureCategory(result.error),
    };
}

function getFailedStep(result: TestResult): string {
    const testSteps = result.steps.filter((step) => step.category === 'test.step');
    const failed = testSteps.find((step) => step.error);
    if (failed?.title) {
        return failed.title;
    }
    const last = testSteps[testSteps.length - 1];
    return last?.title ?? 'Paso no identificado';
}

interface ModuleStats {
    passed: number;
    failed: number;
    errors: number;
    skipped: number;
}

class DiscordReporter implements Reporter {
    private readonly modules = new Map<string, ModuleStats>();
    private readonly qaFailures: QaFailure[] = [];
    private startTime = 0;

    private isSetupTest(test: TestCase): boolean {
        const file = test.location?.file ?? '';
        return file.includes('.setup.ts');
    }

    onBegin(): void {
        this.startTime = Date.now();
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        if (this.isSetupTest(test)) {
            return;
        }
        const module = extractModuleFromFile(test.location?.file ?? '');
        const willRetry =
            (result.status === 'failed' || result.status === 'timedOut') &&
            result.retry < test.retries;
        if (willRetry) {
            return;
        }

        const stats = this.modules.get(module) ?? {passed: 0, failed: 0, errors: 0, skipped: 0};
        switch (result.status) {
            case 'passed':
                stats.passed++;
                break;
            case 'failed':
                stats.failed++;
                this.qaFailures.push(buildQaFailure(test, result));
                break;
            case 'timedOut':
                stats.errors++;
                this.qaFailures.push(buildQaFailure(test, result));
                break;
            case 'skipped':
                stats.skipped++;
                break;
            default:
                break;
        }
        this.modules.set(module, stats);
    }

    async onEnd(result: FullResult): Promise<void> {
        if (!discordEnv.enabled) {
            return;
        }

        const partial = this.buildPartial(result);

        if (process.env.PW_DISCORD_MODE === 'partial') {
            this.writePartial(partial);
            return;
        }

        if (!discordEnv.webhookUrl) {
            console.warn('[discord-reporter] DISCORD_WEBHOOK_URL no configurada — mensaje omitido (la corrida no se bloquea).');
            return;
        }


        const payload = mergePartials([partial], []);
        const content = formatDiscordMessage(payload, {
            userId: normalizeMention(process.env.DISCORD_USER_ID),
        });
        await postToDiscord(content, {
            webhookUrl: discordEnv.webhookUrl,
            dryRun: discordEnv.dryRun,
        });
    }

    private buildPartial(result: FullResult): DiscordPartial {
        const project =
            process.env.PW_DISCORD_PROJECT ??
            projectKeyFromReportOutput(process.env.PW_REPORT_OUTPUT) ??
            'desconocido';
        const module = this.runModule(project);
        const stats = this.totalStats();
        return {
            project,
            module,
            started: this.startTime,
            passed: stats.passed,
            failed: stats.failed,
            errors: stats.errors,
            skipped: stats.skipped,
            durationMs: result.duration,
            qaFailures: this.qaFailures,
            htmlLink: process.env.PW_HTML_OUTPUT ?? '',
        };
    }

    /**
     * Módulo de la corrida = carpeta común más profunda de todos los tests
     * ejecutados (jerarquía real, PascalCase). Así:
     *   - Proyecto entero (varias subcarpetas) → 'PuntoVenta'
     *   - Solo la carpeta Boleta (varios PV-xx) → 'PuntoVenta/Boleta'
     *   - Un solo test en PV-01 → 'PuntoVenta/Boleta/PV01EmisionStockDatosAdicionales'
     * Si no hay tests o las raíces difieren (ej. PuntoVenta + Busqueda bajo el
     * mismo proyecto), cae al nombre de proyecto.
     */
    private runModule(project: string): string {
        const keys = [...this.modules.keys()];
        if (keys.length === 0) {
            return project !== 'desconocido' ? project : 'Otros';
        }
        const ancestor = commonAncestor(keys);
        return ancestor || project;
    }

    private totalStats(): ModuleStats {
        let passed = 0;
        let failed = 0;
        let errors = 0;
        let skipped = 0;
        for (const s of this.modules.values()) {
            passed += s.passed;
            failed += s.failed;
            errors += s.errors;
            skipped += s.skipped;
        }
        return {passed, failed, errors, skipped};
    }

    private writePartial(partial: DiscordPartial): void {
        const dir = path.join('test-results', '.discord-partials');
        mkdirSync(dir, {recursive: true});
        const file = path.join(dir, `${partial.project}.json`);
        writeFileSync(file, JSON.stringify(partial, null, 2), 'utf8');
        console.log(`[discord-reporter] Parcial escrito: ${file}`);
    }
}

/**
 * Devuelve la carpeta común más profunda entre una lista de módulos
 * (rutas jerárquicas separadas por '/'). Ej:
 *   ['PuntoVenta/Boleta/X', 'PuntoVenta/Boleta/Y'] → 'PuntoVenta/Boleta'
 *   ['PuntoVenta/Boleta/X', 'PuntoVenta/Factura/Y'] → 'PuntoVenta'
 *   ['PuntoVenta/Boleta/X'] → 'PuntoVenta/Boleta/X'
 *   [] → ''
 */
function commonAncestor(modules: string[]): string {
    if (modules.length === 0) return '';
    const segments = modules.map((m) => m.split('/'));
    let depth = 0;
    while (depth < segments[0].length) {
        const candidate = segments[0][depth];
        if (!segments.every((s) => s[depth] === candidate)) break;
        depth++;
    }
    return segments[0].slice(0, depth).join('/');
}

export default DiscordReporter;
