import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

let passed = 0;
let failed = 0;

async function it(name: string, fn: () => Promise<void> | void): Promise<void> {
    try {
        await fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (e) {
        failed++;
        const msg = (e as Error).message.split('\n')[0];
        console.log(`  ✗ ${name} — ${msg}`);
    }
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const DISCORD_VARS = [
    'DISCORD_REPORT_ENABLED',
    'DISCORD_WEBHOOK_URL',
    'DISCORD_TESTER_NAME',
    'DISCORD_USER_ID',

    'DISCORD_DRY_RUN',
] as const;

function ensureBaseEnv(): void {
    if (!process.env.APP_ENV) process.env.APP_ENV = 'prd';
    if (!process.env.USER_EMAIL) process.env.USER_EMAIL = 'test@test.com';
    if (!process.env.USER_PASSWORD) process.env.USER_PASSWORD = 'test-pass';
}

function clearDiscordVars(): void {
    for (const v of DISCORD_VARS) delete process.env[v];
}

interface RunnerModule {
    buildDiscordEnv: (base: NodeJS.ProcessEnv, projectKey: string, mode: 'partial' | 'direct') => NodeJS.ProcessEnv;
    consolidateDiscordReport: (partialsDir?: string) => Promise<void>;
}

/** Importa test-runner.mts SIN disparar el menú interactivo (guarda IS_MAIN). */
async function loadRunnerModule(): Promise<RunnerModule> {
    ensureBaseEnv();
    const mod = await import('../../scripts/test-runner.mts');
    return mod as unknown as RunnerModule;
}

interface PartialShape {
    project: string;
    module: string;
    started: number;
    passed: number;
    failed: number;
    errors: number;
    skipped: number;
    durationMs: number;
    qaFailures: Array<{caseName: string; failedStep: string; userMessage: string; failureCategory: string}>;
    htmlLink: string;
}

function makePartial(overrides: Partial<PartialShape> = {}): PartialShape {
    return {
        project: 'PuntoVenta',
        module: 'PuntoVenta',
        started: 1000,
        passed: 5,
        failed: 1,
        errors: 0,
        skipped: 1,
        durationMs: 60_000,
        qaFailures: [],
        htmlLink: 'playwright-report/puntoventa',
        ...overrides,
    };
}

/** Reemplaza global fetch para garantizar CERO red en tests (throw por defecto). */
function mockFetch(behavior?: (url: string, init?: any) => Promise<unknown> | unknown): {
    calls: Array<{url: string; init?: any}>;
    restore: () => void;
} {
    const calls: Array<{url: string; init?: any}> = [];
    const origFetch = (globalThis as any).fetch;
    (globalThis as any).fetch = async (url: string, init?: any) => {
        calls.push({url, init});
        if (behavior) return await behavior(url, init);
        throw new Error('fetch no debe llamarse (red simulada)');
    };
    return {
        calls,
        restore: () => {
            (globalThis as any).fetch = origFetch;
        },
    };
}

function captureLogs(): {logs: string[]; warns: string[]; restore: () => void} {
    const logs: string[] = [];
    const warns: string[] = [];
    const origLog = console.log;
    const origWarn = console.warn;
    console.log = (...args: unknown[]) => {
        logs.push(args.map(String).join(' '));
    };
    console.warn = (...args: unknown[]) => {
        warns.push(args.map(String).join(' '));
    };
    return {
        logs,
        warns,
        restore: () => {
            console.log = origLog;
            console.warn = origWarn;
        },
    };
}

const TMP_PARTIALS = path.join(ROOT, 'test-results', '.discord-partials-consolidate');

function writePartial(project: string, data: unknown): void {
    fs.mkdirSync(TMP_PARTIALS, {recursive: true});
    fs.writeFileSync(path.join(TMP_PARTIALS, `${project}.json`), JSON.stringify(data), 'utf8');
}

function cleanupPartials(): void {
    if (fs.existsSync(TMP_PARTIALS)) {
        fs.rmSync(TMP_PARTIALS, {recursive: true, force: true});
    }
}

async function main(): Promise<void> {
    console.log('\n=== scripts/test-runner.mts — wiring Discord (envs child + consolidate) — Unit Tests ===\n');

    const mod = await loadRunnerModule();

    // ═══════════════ buildDiscordEnv (tarea 3.1) ═══════════════
    console.log('  ── buildDiscordEnv (env de child processes: PW_DISCORD_PROJECT / PW_DISCORD_MODE) ──');

    await it('buildDiscordEnv: modo partial → PW_DISCORD_PROJECT + PW_DISCORD_MODE=partial, base preservada', () => {
        const base: NodeJS.ProcessEnv = {...process.env, PW_REPORT_OUTPUT: 'test-results/puntoventa/results.json'};
        const env = mod.buildDiscordEnv(base, 'PuntoVenta', 'partial');
        assert.strictEqual(env.PW_DISCORD_PROJECT, 'PuntoVenta', 'proyecto seteado');
        assert.strictEqual(env.PW_DISCORD_MODE, 'partial', 'modo partial para RunAll');
        assert.strictEqual(env.PW_REPORT_OUTPUT, 'test-results/puntoventa/results.json', 'base preservada');
        assert.strictEqual(base.PW_DISCORD_PROJECT, undefined, 'no debe mutar la base');
    });

    await it('buildDiscordEnv: modo direct → PW_DISCORD_PROJECT sin PW_DISCORD_MODE (POST directo single-project)', () => {
        const env = mod.buildDiscordEnv({...process.env}, 'Logistica', 'direct');
        assert.strictEqual(env.PW_DISCORD_PROJECT, 'Logistica', 'proyecto seteado');
        assert.strictEqual(env.PW_DISCORD_MODE, undefined, 'direct no setea PW_DISCORD_MODE');
    });

    await it('buildDiscordEnv: aplicado a los 4 proyectos de RunAll (PuntoVenta/Facturacion/Logistica/Clientes)', () => {
        const keys = ['PuntoVenta', 'Facturacion', 'Logistica', 'Clientes'];
        for (const key of keys) {
            const env = mod.buildDiscordEnv({...process.env}, key as any, 'partial');
            assert.strictEqual(env.PW_DISCORD_PROJECT, key, `${key} → PW_DISCORD_PROJECT`);
            assert.strictEqual(env.PW_DISCORD_MODE, 'partial', `${key} → PW_DISCORD_MODE=partial`);
        }
    });

    // ═══════════════ consolidateDiscordReport (tarea 3.2) ═══════════════
    console.log('  ── consolidateDiscordReport (RunAll: merge parciales → POST único) ──');

    await it('consolidate: gate off → no-op total (sin POST ni avisos)', async () => {
        clearDiscordVars();
        cleanupPartials();
        writePartial('PuntoVenta', makePartial());
        const fake = mockFetch();
        const c = captureLogs();
        try {
            await mod.consolidateDiscordReport(TMP_PARTIALS);
        } finally {
            c.restore();
            fake.restore();
            cleanupPartials();
        }
        assert.strictEqual(fake.calls.length, 0, 'gate off no hace HTTP');
        assert.strictEqual(c.warns.length, 0, 'gate off no avisa nada');
    });

    await it('consolidate: dry-run → log del mensaje sin HTTP (0 fetch)', async () => {
        clearDiscordVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        process.env.DISCORD_WEBHOOK_URL = 'https://example.test/hook';
        process.env.DISCORD_DRY_RUN = '1';
        cleanupPartials();
        writePartial('PuntoVenta', makePartial({project: 'PuntoVenta'}));
        writePartial('Facturacion', makePartial({project: 'Facturacion', module: 'Facturacion', passed: 3, failed: 0}));
        const fake = mockFetch();
        const c = captureLogs();
        try {
            await mod.consolidateDiscordReport(TMP_PARTIALS);
        } finally {
            c.restore();
            fake.restore();
            cleanupPartials();
        }
        assert.strictEqual(fake.calls.length, 0, 'dry-run no hace HTTP');
        assert.ok(c.logs.some((l) => l.includes('[dry-run]')), 'debe loguear el mensaje en dry-run');
    });

    await it('consolidate: 4 parciales (RunAll completo) → EXACTAMENTE UN POST con desglose por módulo', async () => {
        clearDiscordVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        process.env.DISCORD_WEBHOOK_URL = 'https://example.test/hook';
        delete process.env.DISCORD_DRY_RUN;
        cleanupPartials();
        writePartial('PuntoVenta', makePartial({
            project: 'PuntoVenta',
            passed: 5,
            failed: 1,
            qaFailures: [{caseName: 'Emitir boleta', failedStep: 'Confirmar', userMessage: 'Botón no visible', failureCategory: 'SCRIPT'}],
        }));
        writePartial('Facturacion', makePartial({project: 'Facturacion', module: 'Facturacion', passed: 3, failed: 0}));
        writePartial('Logistica', makePartial({project: 'Logistica', module: 'Logistica', passed: 2, failed: 0}));
        writePartial('Clientes', makePartial({project: 'Clientes', module: 'Clientes', passed: 4, failed: 0}));
        const fake = mockFetch(async () => ({ok: true} as Response));
        const c = captureLogs();
        try {
            await mod.consolidateDiscordReport(TMP_PARTIALS);
        } finally {
            c.restore();
            fake.restore();
            cleanupPartials();
        }
        assert.strictEqual(fake.calls.length, 1, 'un solo POST consolidado');
        const body = JSON.parse(fake.calls[0].init.body);
        assert.ok(body.content.includes('**PuntoVenta**'), 'fila módulo PuntoVenta');
        assert.ok(body.content.includes('**Facturacion**'), 'fila módulo Facturacion');
        assert.ok(body.content.includes('**Logistica**'), 'fila módulo Logistica');
        assert.ok(body.content.includes('**Clientes**'), 'fila módulo Clientes');
        assert.ok(body.content.includes('5 pasaron, 1 fallaron'), 'totales PuntoVenta');
        assert.ok(body.content.includes('❌ **FALLIDO**'), 'estado global FALLIDO');
        assert.ok(body.content.includes('Emitir boleta'), 'fallo funcional incluido');
        assert.strictEqual(c.warns.length, 0, 'con los 4 parciales → sin avisos de faltantes');
    });

    await it('consolidate: parcial faltante/corrupto → aviso en warns y POST con los presentes', async () => {
        clearDiscordVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        process.env.DISCORD_WEBHOOK_URL = 'https://example.test/hook';
        cleanupPartials();
        writePartial('PuntoVenta', makePartial({project: 'PuntoVenta', passed: 2, failed: 0}));
        writePartial('Logistica', '{json-corrupto');
        const fake = mockFetch(async () => ({ok: true} as Response));
        const c = captureLogs();
        try {
            await mod.consolidateDiscordReport(TMP_PARTIALS);
        } finally {
            c.restore();
            fake.restore();
            cleanupPartials();
        }
        assert.strictEqual(fake.calls.length, 1, 'POST con los presentes igual se envía');
        const body = JSON.parse(fake.calls[0].init.body);
        assert.ok(body.content.includes('**PuntoVenta**'), 'parcial presente consolidado');
        assert.ok(!body.content.includes('**Logistica**'), 'corrupto no figura como módulo');
        assert.ok(c.warns.some((w) => w.includes('Logistica')), 'aviso del proyecto sin parcial');
    });



    await it('consolidate: corrida verde con DISCORD_USER_ID → mención del ejecutor SIEMPRE presente', async () => {
        clearDiscordVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        process.env.DISCORD_WEBHOOK_URL = 'https://example.test/hook';
        process.env.DISCORD_USER_ID = '123';
        cleanupPartials();
        writePartial('PuntoVenta', makePartial({project: 'PuntoVenta', passed: 4, failed: 0, errors: 0, qaFailures: []}));
        const fake = mockFetch(async () => ({ok: true} as Response));
        const c = captureLogs();
        try {
            await mod.consolidateDiscordReport(TMP_PARTIALS);
        } finally {
            c.restore();
            fake.restore();
            cleanupPartials();
        }
        assert.strictEqual(fake.calls.length, 1, 'verde sin solo-fallos → igual envía');
        const body = JSON.parse(fake.calls[0].init.body);
        assert.ok(body.content.includes('✅ **EXITOSO**'), 'estado EXITOSO');
        assert.ok(body.content.includes('<@123>'), 'verde: mención del ejecutor SIEMPRE (userId configurado)');
        assert.ok(!body.content.includes('<@&'), 'nunca debe mencionar un rol');
    });

    await it('consolidate: sin DISCORD_USER_ID → mensaje sin mención (degrada sin error)', async () => {
        clearDiscordVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        process.env.DISCORD_WEBHOOK_URL = 'https://example.test/hook';
        cleanupPartials();
        writePartial('PuntoVenta', makePartial({project: 'PuntoVenta', passed: 4, failed: 1, qaFailures: []}));
        const fake = mockFetch(async () => ({ok: true} as Response));
        const c = captureLogs();
        try {
            await mod.consolidateDiscordReport(TMP_PARTIALS);
        } finally {
            c.restore();
            fake.restore();
            cleanupPartials();
        }
        assert.strictEqual(fake.calls.length, 1, 'con fallos envía igual');
        const body = JSON.parse(fake.calls[0].init.body);
        assert.ok(!body.content.includes('<@'), 'sin userId no debe haber mención');
        assert.ok(body.content.includes('❌ **FALLIDO**'), 'estado FALLIDO');
    });

    await it('consolidate: sin webhook → warning y sin POST (no bloquea)', async () => {
        clearDiscordVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        cleanupPartials();
        writePartial('PuntoVenta', makePartial());
        const fake = mockFetch();
        const c = captureLogs();
        try {
            await mod.consolidateDiscordReport(TMP_PARTIALS);
        } finally {
            c.restore();
            fake.restore();
            cleanupPartials();
        }
        assert.strictEqual(fake.calls.length, 0, 'sin webhook no envía');
        assert.ok(c.warns.some((w) => w.includes('DISCORD_WEBHOOK_URL')), 'debe advertir por webhook ausente');
    });

    await it('consolidate: sin ningún parcial → warning y sin POST', async () => {
        clearDiscordVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        process.env.DISCORD_WEBHOOK_URL = 'https://example.test/hook';
        cleanupPartials();
        const fake = mockFetch();
        const c = captureLogs();
        try {
            await mod.consolidateDiscordReport(TMP_PARTIALS);
        } finally {
            c.restore();
            fake.restore();
            cleanupPartials();
        }
        assert.strictEqual(fake.calls.length, 0, 'sin parciales no envía');
        assert.ok(c.warns.some((w) => w.includes('No hay parciales')), 'debe advertir que no hay parciales');
    });

    console.log(`\n  ──────────────────────────────────────`);
    console.log(`  Total: ${passed + failed} | ✅ ${passed} passed | ❌ ${failed} failed\n`);

    if (failed > 0) {
        process.exit(1);
    }
}

main().catch((e) => {
    console.error('\n  Test suite error:', e);
    process.exit(1);
});
