import {strict as assert} from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

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

const ROOT = path.resolve(__dirname, '..', '..');

const DISCORD_VARS = [
    'DISCORD_REPORT_ENABLED',
    'DISCORD_WEBHOOK_URL',
    'DISCORD_TESTER_NAME',
    'DISCORD_USER_ID',
    'DISCORD_MENTION_ROLE',
    'DISCORD_ONLY_FAILURES',
    'DISCORD_DRY_RUN',
] as const;

// Tipado local: permite que el test compile aunque config/env.ts aún no exporte
// los símbolos (fase RED del TDD). En runtime falla hasta que existan.
interface DiscordEnvBlock {
    enabled: boolean;
    webhookUrl?: string;
    testerName?: string;
    userId?: string;
    mentionRole?: string;
    onlyFailures: boolean;
    dryRun: boolean;
}
interface EnvModuleShape {
    discordEnv: DiscordEnvBlock;
    normalizeMention: (raw: string | undefined, kind: 'user' | 'role') => string | undefined;
}

function clearDiscordVars(): void {
    for (const v of DISCORD_VARS) {
        delete process.env[v];
    }
}

// config/env.ts llama required('APP_ENV'/'USER_EMAIL'/'USER_PASSWORD') al cargar.
// Garantizamos valores base antes del primer import (mismo patrón defensivo que setup-state.test.ts).
function ensureBaseEnv(): void {
    if (!process.env.APP_ENV) process.env.APP_ENV = 'prd';
    if (!process.env.USER_EMAIL) process.env.USER_EMAIL = 'test@test.com';
    if (!process.env.USER_PASSWORD) process.env.USER_PASSWORD = 'test-pass';
}

// Recarga config/env.ts limpiando el cache del módulo: discordEnv captura
// process.env al cargar, así que cada configuración requiere un reload.
function requireEnvModule(): EnvModuleShape {
    const resolved = require.resolve('../../config/env');
    delete require.cache[resolved];
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(resolved) as EnvModuleShape;
}

async function main(): Promise<void> {
    console.log('\n=== config/env.ts — Discord env + normalizeMention — Unit Tests ===\n');

    ensureBaseEnv();

    const envFilePath = path.join(ROOT, 'config', 'environment.env');
    const envFileExists = fs.existsSync(envFilePath);

    console.log('  ── normalizeMention() (función pura) ──');

    const mod = requireEnvModule();

    await it('normalizeMention: id crudo de usuario → <@id>', async () => {
        assert.strictEqual(mod.normalizeMention('123', 'user'), '<@123>');
    });

    await it('normalizeMention: id de usuario ya envuelto <@id> se mantiene', async () => {
        assert.strictEqual(mod.normalizeMention('<@123>', 'user'), '<@123>');
    });

    await it('normalizeMention: id crudo de rol → <@&id>', async () => {
        assert.strictEqual(mod.normalizeMention('456', 'role'), '<@&456>');
    });

    await it('normalizeMention: rol ya envuelto <@&id> se mantiene', async () => {
        assert.strictEqual(mod.normalizeMention('<@&456>', 'role'), '<@&456>');
    });

    await it('normalizeMention: undefined o vacío → undefined (sin romper)', async () => {
        assert.strictEqual(mod.normalizeMention(undefined, 'user'), undefined);
        assert.strictEqual(mod.normalizeMention('', 'role'), undefined);
    });

    await it('normalizeMention: tolera espacios alrededor del id', async () => {
        assert.strictEqual(mod.normalizeMention('  <@789>  ', 'user'), '<@789>');
        assert.strictEqual(mod.normalizeMention('  1011  ', 'role'), '<@&1011>');
    });

    console.log('  ── discordEnv sin variables (no-throwing) ──');

    await it('discordEnv sin vars DISCORD_*: no lanza y usa defaults', async () => {
        clearDiscordVars();
        const m = requireEnvModule();
        assert.strictEqual(typeof m.discordEnv, 'object');
        assert.strictEqual(m.discordEnv.enabled, false);
        assert.strictEqual(m.discordEnv.webhookUrl, undefined);
        assert.strictEqual(m.discordEnv.testerName, undefined);
        assert.strictEqual(m.discordEnv.userId, undefined);
        assert.strictEqual(m.discordEnv.mentionRole, undefined);
        assert.strictEqual(m.discordEnv.onlyFailures, false);
        assert.strictEqual(m.discordEnv.dryRun, false);
    });

    console.log('  ── discordEnv con variables (mapeo) ──');

    await it('discordEnv con vars: mapea y normaliza menciones', async () => {
        clearDiscordVars();
        process.env.DISCORD_REPORT_ENABLED = '1';
        process.env.DISCORD_WEBHOOK_URL = 'https://example.test/hook';
        process.env.DISCORD_TESTER_NAME = 'Ana';
        process.env.DISCORD_USER_ID = '123';
        process.env.DISCORD_MENTION_ROLE = '<@&456>';
        process.env.DISCORD_ONLY_FAILURES = '1';
        process.env.DISCORD_DRY_RUN = '1';
        const m = requireEnvModule();
        assert.strictEqual(m.discordEnv.enabled, true);
        assert.strictEqual(m.discordEnv.webhookUrl, 'https://example.test/hook');
        assert.strictEqual(m.discordEnv.testerName, 'Ana');
        assert.strictEqual(m.discordEnv.userId, '<@123>');
        assert.strictEqual(m.discordEnv.mentionRole, '<@&456>');
        assert.strictEqual(m.discordEnv.onlyFailures, true);
        assert.strictEqual(m.discordEnv.dryRun, true);
    });

    await it('discordEnv acepta "true" (case-insensitive) como flag', async () => {
        clearDiscordVars();
        process.env.DISCORD_REPORT_ENABLED = 'TRUE';
        process.env.DISCORD_DRY_RUN = 'true';
        const m = requireEnvModule();
        assert.strictEqual(m.discordEnv.enabled, true);
        assert.strictEqual(m.discordEnv.dryRun, true);
    });

    await it('discordEnv: "0"/vacío no activan flags', async () => {
        clearDiscordVars();
        process.env.DISCORD_REPORT_ENABLED = '0';
        process.env.DISCORD_ONLY_FAILURES = '';
        const m = requireEnvModule();
        assert.strictEqual(m.discordEnv.enabled, false);
        assert.strictEqual(m.discordEnv.onlyFailures, false);
    });

    console.log('  ── config/environment.env — plantilla DISCORD_* ──');

    await it('environment.env: contiene plantilla comentada de todas las vars DISCORD_*', async () => {
        if (!envFileExists) {
            console.log('  ⊘ (skip: config/environment.env no existe en este checkout — archivo gitignored, plantilla local no verificable)');
            return;
        }
        const envFile = fs.readFileSync(envFilePath, 'utf8');
        for (const v of DISCORD_VARS) {
            assert.ok(envFile.includes(`# ${v}=`), `debe existir línea comentada para ${v}`);
        }
    });

    await it('environment.env: ninguna var DISCORD_* activa (todo comentado)', async () => {
        if (!envFileExists) {
            console.log('  ⊘ (skip: config/environment.env no existe en este checkout — archivo gitignored)');
            return;
        }
        const envFile = fs.readFileSync(envFilePath, 'utf8');
        const activeLines = envFile.split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.startsWith('DISCORD_') && !l.startsWith('#'));
        assert.deepStrictEqual(activeLines, [], 'no debe haber vars DISCORD_* activas en la plantilla');
    });

    console.log('  ── playwright.config.ts — reporter JSON ──');

    await it('playwright.config.ts: registra reporter json honrando PW_REPORT_OUTPUT', async () => {
        const cfg = fs.readFileSync(path.join(ROOT, 'playwright.config.ts'), 'utf8');
        assert.ok(cfg.includes('"json"'), 'debe registrar el reporter json');
        assert.ok(cfg.includes('PW_REPORT_OUTPUT'), 'debe honrar PW_REPORT_OUTPUT');
        assert.ok(cfg.includes('test-results/results.json'), 'debe usar test-results/results.json como default');
    });

    console.log('  ── scripts/analyze-results.ts — parsea el esquema del JSON reporter ──');

    await it('analyze-results: extrae specs con status "unexpected" y omite "expected"', async () => {
        const {parseResultsFile} = await import('../../scripts/analyze-results.js');
        const tmpFile = path.join(ROOT, 'test-results', '.unit-tests', 'synthetic-unexpected.json');
        fs.mkdirSync(path.dirname(tmpFile), {recursive: true});
        fs.writeFileSync(tmpFile, JSON.stringify({
            suites: [{
                specs: [
                    {title: 'falla de negocio', tests: [{status: 'unexpected'}]},
                    {title: 'pasó correctamente', tests: [{status: 'expected'}]},
                ],
            }],
        }), 'utf8');
        assert.deepStrictEqual(parseResultsFile(tmpFile), ['falla de negocio']);
    });

    await it('analyze-results: detecta "timedOut" y recorre suites anidadas', async () => {
        const {parseResultsFile} = await import('../../scripts/analyze-results.js');
        const tmpFile = path.join(ROOT, 'test-results', '.unit-tests', 'synthetic-timedout.json');
        fs.mkdirSync(path.dirname(tmpFile), {recursive: true});
        fs.writeFileSync(tmpFile, JSON.stringify({
            suites: [{
                suites: [{
                    specs: [
                        {title: 'cuelga en login', tests: [{status: 'timedOut'}]},
                        {title: 'ok', tests: [{status: 'passed'}]},
                    ],
                }],
            }],
        }), 'utf8');
        assert.deepStrictEqual(parseResultsFile(tmpFile), ['cuelga en login']);
    });

    await it('analyze-results: corrida verde → sin títulos; archivo inexistente → []', async () => {
        const {parseResultsFile} = await import('../../scripts/analyze-results.js');
        const greenFile = path.join(ROOT, 'test-results', '.unit-tests', 'synthetic-green.json');
        fs.mkdirSync(path.dirname(greenFile), {recursive: true});
        fs.writeFileSync(greenFile, JSON.stringify({
            suites: [{
                specs: [
                    {title: 'todo ok 1', tests: [{status: 'expected'}]},
                    {title: 'todo ok 2', tests: [{status: 'expected'}]},
                ],
            }],
        }), 'utf8');
        assert.deepStrictEqual(parseResultsFile(greenFile), []);
        assert.deepStrictEqual(parseResultsFile(path.join(ROOT, 'test-results', 'no-existe.json')), []);
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
