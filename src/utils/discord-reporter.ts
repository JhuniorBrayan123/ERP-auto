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
    /** Duración = FullResult.duration (ms). */
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

/** Módulo derivado del spec path (espejo de PROJECT_CONFIG del runner). */
export function extractModuleFromFile(file: string): string {
    const f = file.replace(/\\/g, '/');
    if (f.includes('/Emisiones/Facturacion/')) return 'Facturacion';
    if (f.includes('/Emisiones/')) return 'PuntoVenta';
    if (f.includes('/Logistica/')) return 'Logistica';
    if (f.includes('/ClientesProveedores/')) return 'Clientes';
    return 'Otros';
}

/**
 * Fallback de proyecto: parsea PW_REPORT_OUTPUT del estilo
 * `test-results/<key>/results.json` → nombre de proyecto legible.
 */
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
 * Mensaje consolidado ≤ 2000 chars: cabecera + tabla de módulos siempre,
 * fallos top-N hasta presupuesto y cola `… +N más`. La mención del ejecutor
 * (si `DISCORD_USER_ID` está configurado) aparece SIEMPRE, pase o no la
 * corrida. Sin userId → el mensaje se envía sin mención (sin error).
 */
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
        `⏱️ **Duración:** ${formatDurationMs(payload.durationMs)}`,
    ];

    const header = `${mentionLine}${SEP}\n\n${headerLines.join('\n')}\n\n${SEP}\n\n`;

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
    const moduleSection = `📋 **RESULTADOS POR MÓDULO**\n\n${moduleLines.join('\n')}\n\n${SEP}\n\n`;

    const state = hasFailures ? '❌ **FALLIDO**' : '✅ **EXITOSO**';
    const total = payload.total;
    const totalCount = total.passed + total.failed + total.errors + total.skipped;
    const parts = [`${total.passed} ✅`];
    if (total.failed > 0) parts.push(`${total.failed} ❌`);
    if (total.errors > 0) parts.push(`${total.errors} ⚠️`);
    if (total.skipped > 0) parts.push(`${total.skipped} ➖`);

    const summarySection =
        `📊 **RESUMEN GLOBAL**\n**Estado:** ${state}\n` +
        `**Total:** ${totalCount} (${parts.join(' | ')})\n\n${SEP}\n`;

    let body = `${header}${moduleSection}${summarySection}`;

    if (payload.failures.length > 0) {
        body += `\n❌ **TOP FALLOS**\n`;
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



/** Consolida los parciales en un payload único (totales, fallos, links, metadata). */
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

/** POST al webhook de Discord. dryRun → solo log, sin HTTP. Nunca lanza. */
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

/**
 * Lee los parciales de disco (escritos por onEnd en modo partial).
 * Robustez: archivo ausente, JSON corrupto o estructura inválida → entra a
 * `missing` (con aviso en consola); nunca lanza (un parcial roto no debe
 * tumbar la consolidación del reporte).
 */
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

/**
 * Reporter de Discord 100% configurado por env (sin secretos en código).
 * - Skip de setup (`.setup.ts` sin `auth.setup.ts`); solo cuenta el intento final (willRetry).
 * - `PW_DISCORD_MODE=partial` → escribe `test-results/.discord-partials/{project}.json` (sin POST).
 * - Modo unset → POST directo desde onEnd (gate, webhook y solo-fallos se respetan).
 */
class DiscordReporter implements Reporter {
    private readonly modules = new Map<string, ModuleStats>();
    private readonly qaFailures: QaFailure[] = [];
    private startTime = 0;

    private isSetupTest(test: TestCase): boolean {
        const file = test.location?.file ?? '';
        return file.includes('.setup.ts') && !file.includes('auth.setup.ts');
    }

    onBegin(): void {
        this.startTime = Date.now();
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        if (this.isSetupTest(test)) {
            return;
        }
        // titlePath()[0] es el nombre del proyecto Playwright cuando existe y no es vacío.
        // Fallback: deducir del path del archivo si no hay proyecto seleccionado.
        const projectName = test.titlePath()[0];
        const module = (projectName && projectName.trim() !== '')
            ? projectName
            : extractModuleFromFile(test.location?.file ?? '');
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
        // PW_DISCORD_PROJECT es seteado por el runner con el nombre exacto del proyecto.
        // Es la fuente más confiable. Solo si no existe, intentamos deducirlo.
        const module = project !== 'desconocido' ? project : this.dominantModule();
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

    private dominantModule(): string {
        let best = 'Otros';
        let bestCount = -1;
        for (const [module, stats] of this.modules) {
            const count = stats.passed + stats.failed + stats.errors + stats.skipped;
            if (count > bestCount) {
                best = module;
                bestCount = count;
            }
        }
        return best;
    }

    private writePartial(partial: DiscordPartial): void {
        const dir = path.join('test-results', '.discord-partials');
        mkdirSync(dir, {recursive: true});
        const file = path.join(dir, `${partial.project}.json`);
        writeFileSync(file, JSON.stringify(partial, null, 2), 'utf8');
        console.log(`[discord-reporter] Parcial escrito: ${file}`);
    }
}

export default DiscordReporter;
