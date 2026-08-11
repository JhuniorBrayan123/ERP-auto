/**
 * Verificación del payload del reporter de Discord — sin secretos, sin red real.
 *
 * Uso:
 *   npx tsx scripts/verify-discord-payload.mts            # invariantes offline (sin red)
 *   npx tsx scripts/verify-discord-payload.mts --mock     # + POST real a http server local
 *
 * --mock levanta http://127.0.0.1:<puerto>, setea DISCORD_WEBHOOK_URL a ese server
 * y verifica que el body recibido sea el mensaje formateado (≤2000 chars).
 *
 * Exit code != 0 si alguna invariante falla.
 */
import {strict as assert} from 'node:assert';
import http from 'node:http';

// ── env mínimo ANTES de importar módulos que leen config/env ──
if (!process.env.APP_ENV) process.env.APP_ENV = 'prd';
if (!process.env.USER_EMAIL) process.env.USER_EMAIL = 'verify@test.com';
if (!process.env.USER_PASSWORD) process.env.USER_PASSWORD = 'verify-pass';
process.env.ENV_NAME = 'crt-3';
process.env.DISCORD_TESTER_NAME = 'QA Verifier';

const mockMode = process.argv.slice(2).includes('--mock');

const {
    formatDiscordMessage,
    mergePartials,
    postToDiscord,
    DISCORD_MAX_LENGTH,
} = await import('../src/utils/discord-reporter.js');
import type {DiscordPartial, QaFailure} from '../src/utils/discord-reporter.js';

let passed = 0;
let failed = 0;

async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
    try {
        await fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (e) {
        failed++;
        console.log(`  ✗ ${name} — ${(e as Error).message.split('\n')[0]}`);
    }
}

function makeFailure(i: number): QaFailure {
    const categories = ['SCRIPT', 'DATOS', 'AMBIENTE'] as const;
    return {
        caseName: `Caso funcional ${i}`,
        failedStep: `Paso número ${i}`,
        userMessage: `Motivo detallado del caso ${i} con texto suficiente para llenar el presupuesto del mensaje`,
        failureCategory: categories[i % 3],
    };
}

function makePartial(project: string, module: string, passed: number, failed: number, errors: number, skipped: number, qaFailures: QaFailure[] = []): DiscordPartial {
    return {
        project,
        module,
        started: 1_000_000,
        passed,
        failed,
        errors,
        skipped,
        durationMs: 60_000,
        qaFailures,
        htmlLink: `playwright-report/${module.toLowerCase()}`,
    };
}

async function main(): Promise<void> {
    console.log('\n=== verify-discord-payload — invariantes del mensaje Discord ===\n');

    // ── payload sintético: 4 módulos + 60 fallos (fuerza truncado) ──
    const failures = Array.from({length: 60}, (_, i) => makeFailure(i));
    const partials: DiscordPartial[] = [
        makePartial('PuntoVenta', 'PuntoVenta', 10, 2, 0, 1, failures),
        makePartial('Facturacion', 'Facturacion', 4, 0, 0, 0),
        makePartial('Logistica', 'Logistica', 6, 1, 1, 0),
        makePartial('Clientes', 'Clientes', 3, 0, 0, 2),
    ];
    const payload = mergePartials(partials, []);
    const msg = formatDiscordMessage(payload, {userId: '<@123>'});

    console.log('  ── Invariantes de formato (offline, sin red) ──');

    await check('mensaje ≤ 2000 chars', () => {
        assert.ok(msg.length <= DISCORD_MAX_LENGTH, `longitud ${msg.length} excede ${DISCORD_MAX_LENGTH}`);
    });

    await check('desglose por módulo: 4 filas con conteos', () => {
        for (const m of ['PuntoVenta', 'Facturacion', 'Logistica', 'Clientes']) {
            assert.ok(msg.includes(`**${m}**`), `falta fila del módulo ${m}`);
        }
        assert.ok(msg.includes('10 pasaron, 2 fallaron'), 'conteos de PuntoVenta');
        assert.ok(msg.includes('1 fallaron, 1 errores'), 'conteos de Logistica');
    });

    await check('categorías de fallo presentes (SCRIPT/DATOS/AMBIENTE)', () => {
        for (const cat of ['SCRIPT', 'DATOS', 'AMBIENTE']) {
            assert.ok(msg.includes(`[${cat}]`), `falta categoría ${cat} en TOP FALLOS`);
        }
    });

    await check('truncado: cola "… +N más" sin exceder el límite', () => {
        assert.match(msg, /… \+(\d+) más/, 'debe truncar con cola … +N más');
        const remaining = Number(msg.match(/… \+(\d+) más/)![1]);
        assert.ok(remaining > 0 && remaining < 60, `cola inesperada: +${remaining}`);
    });

    await check('mención del ejecutor presente con fallos (sin rol)', () => {
        assert.ok(msg.includes('<@123>'), 'usuario mencionado');
        assert.ok(!msg.includes('<@&'), 'no debe mencionar ningún rol');
    });

    await check('sin fallos → mención SIEMPRE presente; sin userId → sin mención', () => {
        const green = mergePartials([
            makePartial('PuntoVenta', 'PuntoVenta', 12, 0, 0, 0),
        ], []);
        const greenMsg = formatDiscordMessage(green, {userId: '<@123>'});
        assert.ok(greenMsg.includes('✅ **EXITOSO**'), 'estado EXITOSO');
        assert.ok(greenMsg.includes('<@123>'), 'verde: mención del ejecutor SIEMPRE (userId configurado)');
        assert.ok(!greenMsg.includes('<@&'), 'verde: sin rol');
        const noMention = formatDiscordMessage(green);
        assert.ok(!noMention.includes('<@'), 'sin userId: sin mención (degrada sin error)');
    });

    await check('metadata: entorno, tester, duración, commit y branch', () => {
        assert.ok(msg.includes('CRT-3'), 'entorno (getEnvironmentLabel)');
        assert.ok(msg.includes('QA Verifier'), 'tester (DISCORD_TESTER_NAME)');
        assert.ok(msg.includes('4 min 0 sec'), 'duración formateada');
        assert.match(msg, /\*\*Commit:\*\* [0-9a-f]{7,40}/, 'commit corto de git');
        assert.match(msg, /\([^)]*feature-[^)]*\)|\([^)]*main[^)]*\)/, 'branch actual');
    });

    await check('link HTML presente', () => {
        assert.ok(msg.includes('playwright-report/puntoventa'), 'htmlLink de PuntoVenta');
    });

    if (mockMode) {
        console.log('\n  ── Modo --mock: POST real a http server local ──');

        await check('POST real: server recibe 1 request con el body formateado', async () => {
            const received: Array<{body: string}> = [];
            const server = http.createServer((req, res) => {
                let raw = '';
                req.on('data', (chunk: Buffer) => {
                    raw += chunk.toString('utf8');
                });
                req.on('end', () => {
                    received.push({body: raw});
                    res.writeHead(204, {'Content-Type': 'application/json'});
                    res.end();
                });
            });
            await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
            const address = server.address() as {port: number};
            const webhookUrl = `http://127.0.0.1:${address.port}`;

            try {
                await postToDiscord(msg, {webhookUrl, dryRun: false});
            } finally {
                await new Promise<void>((resolve) => server.close(() => resolve()));
            }

            assert.strictEqual(received.length, 1, 'debe recibir exactamente 1 request');
            const parsed = JSON.parse(received[0].body) as {content: string};
            assert.strictEqual(parsed.content, msg, 'body recibido == mensaje formateado');
            assert.ok(parsed.content.length <= DISCORD_MAX_LENGTH, 'body recibido ≤ 2000 chars');
        });

        await check('dry-run con --mock: NO hace HTTP (solo log)', async () => {
            const server = http.createServer((_req, res) => res.end());
            await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
            const address = server.address() as {port: number};
            const origLog = console.log;
            const logs: string[] = [];
            console.log = (...a: unknown[]) => {
                logs.push(a.map(String).join(' '));
            };
            try {
                await postToDiscord(msg, {webhookUrl: `http://127.0.0.1:${address.port}`, dryRun: true});
            } finally {
                console.log = origLog;
                await new Promise<void>((resolve) => server.close(() => resolve()));
            }
            assert.ok(logs.some((l) => l.includes('[dry-run]')), 'dry-run debe loguear sin HTTP');
        });
    }

    console.log(`\n  ──────────────────────────────────────`);
    console.log(`  Total: ${passed + failed} | ✅ ${passed} passed | ❌ ${failed} failed\n`);

    if (failed > 0) {
        process.exit(1);
    }
}

main().catch((e) => {
    console.error('\n  verify-discord-payload error:', e);
    process.exit(1);
});
