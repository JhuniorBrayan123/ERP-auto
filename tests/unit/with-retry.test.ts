import {strict as assert} from 'node:assert';

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

function fakeResponse(status: number): { status: () => number } {
    return { status: () => status };
}

function captureWarn(): { logs: string[]; restore: () => void } {
    const logs: string[] = [];
    const original = console.warn;
    console.warn = (msg?: unknown) => {
        logs.push(String(msg));
    };
    return {
        logs,
        restore: () => {
            console.warn = original;
        },
    };
}

async function main(): Promise<void> {
    console.log('\n=== with-retry.ts — Unit Tests ===\n');

    const mod = await import('@utils/with-retry.js');
    const noSleep = { sleep: async () => {} };

    await it('succeeds on first try → resolves with unmodified value, zero [Retry] logs', async () => {
        const capture = captureWarn();
        try {
            const result = await mod.withRetry(async () => 'X', { ...noSleep, label: 'Test' });
            assert.strictEqual(result, 'X');
            assert.strictEqual(capture.logs.length, 0);
        } finally {
            capture.restore();
        }
    });

    await it('succeeds after one retry (503 then 200) → resolves with unmodified value, exact 4-line log', async () => {
        const capture = captureWarn();
        try {
            let calls = 0;
            const result = await mod.withRetry(
                async () => {
                    calls++;
                    return calls === 1 ? fakeResponse(503) : 'X';
                },
                { ...noSleep, label: 'KardexApi' },
            );
            assert.strictEqual(result, 'X');
            assert.strictEqual(calls, 2);
            assert.strictEqual(capture.logs.length, 1);
            const lines = capture.logs[0].split('\n');
            assert.deepStrictEqual(lines, [
                '[Retry] KardexApi',
                'Error: 503',
                'Intento: 1/3',
                'Esperando: 2000ms',
            ]);
        } finally {
            capture.restore();
        }
    });

    await it('exhausts all attempts under default options (every attempt HTTP 500)', async () => {
        const capture = captureWarn();
        try {
            let calls = 0;
            const result = await mod.withRetry(
                async () => {
                    calls++;
                    return fakeResponse(500);
                },
                { ...noSleep, label: 'AlmacenesApi' },
            );
            assert.strictEqual(calls, 3);
            assert.strictEqual((result as { status: () => number }).status(), 500);
        } finally {
            capture.restore();
        }
    });

    await it('rethrows the original error unchanged after exhaustion', async () => {
        const capture = captureWarn();
        try {
            const originalError = new Error('AlmacenesApi: Falló con status 500 – Internal Server Error');
            let calls = 0;
            await assert.rejects(
                mod.withRetry(
                    async () => {
                        calls++;
                        throw originalError;
                    },
                    { ...noSleep, label: 'AlmacenesApi' },
                ),
                (err: unknown) => err === originalError,
            );
            assert.strictEqual(calls, 3);
        } finally {
            capture.restore();
        }
    });

    await it('429 response is retried (same retry semantics as 5xx)', async () => {
        const capture = captureWarn();
        try {
            let calls = 0;
            const result = await mod.withRetry(
                async () => {
                    calls++;
                    return calls === 1 ? fakeResponse(429) : fakeResponse(200);
                },
                { ...noSleep, label: 'CajasApi' },
            );
            assert.strictEqual(calls, 2);
            assert.strictEqual((result as { status: () => number }).status(), 200);
            assert.strictEqual(capture.logs.length, 1);
            assert.ok(capture.logs[0].includes('Error: 429'));
        } finally {
            capture.restore();
        }
    });

    for (const status of [400, 401, 403, 404, 422]) {
        await it(`non-retryable ${status} fails on attempt 1 with zero retries`, async () => {
            const capture = captureWarn();
            try {
                let calls = 0;
                const result = await mod.withRetry(
                    async () => {
                        calls++;
                        return fakeResponse(status);
                    },
                    { ...noSleep, label: 'ComprobanteApi' },
                );
                assert.strictEqual(calls, 1);
                assert.strictEqual((result as { status: () => number }).status(), status);
                assert.strictEqual(capture.logs.length, 0);
            } finally {
                capture.restore();
            }
        });
    }

    await it('network error path is retried, log line 2 reads the error message', async () => {
        const capture = captureWarn();
        try {
            const networkError = new Error('ECONNREFUSED');
            let calls = 0;
            const result = await mod.withRetry(
                async () => {
                    calls++;
                    if (calls === 1) throw networkError;
                    return 'OK';
                },
                { ...noSleep, label: 'SunatEstadoApi' },
            );
            assert.strictEqual(result, 'OK');
            assert.strictEqual(calls, 2);
            assert.strictEqual(capture.logs.length, 1);
            const lines = capture.logs[0].split('\n');
            assert.deepStrictEqual(lines, [
                '[Retry] SunatEstadoApi',
                'Error: ECONNREFUSED',
                'Intento: 1/3',
                'Esperando: 2000ms',
            ]);
        } finally {
            capture.restore();
        }
    });

    await it('fixed (non-exponential) backoff: every retry log reads Esperando: 2000ms', async () => {
        const capture = captureWarn();
        try {
            let calls = 0;
            await mod.withRetry(
                async () => {
                    calls++;
                    return fakeResponse(500);
                },
                { ...noSleep, label: 'KardexApi' },
            );
            assert.strictEqual(capture.logs.length, 2);
            for (const log of capture.logs) {
                assert.ok(log.endsWith('Esperando: 2000ms'), `unexpected backoff line: ${log}`);
            }
        } finally {
            capture.restore();
        }
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
