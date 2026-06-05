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

function cleanupEnv(): void {
    delete process.env.APP_ENV;
    delete process.env.USER_EMAIL;
}

async function main(): Promise<void> {
    console.log('\n=== setup-state.ts — Unit Tests ===\n');

    const mod = await import('@utils/setup-state');

    console.log('  ── PV_SETUP_NAMES / LOG_SETUP_NAMES ──');

    await it('PV_SETUP_NAMES should contain auth, punto-venta-datos, punto-venta-items', async () => {
        assert.ok(Array.isArray(mod.PV_SETUP_NAMES), 'PV_SETUP_NAMES debe ser un array');
        assert.strictEqual(mod.PV_SETUP_NAMES.length, 3, 'debe tener 3 elementos');
        assert.ok(mod.PV_SETUP_NAMES.includes('auth'));
        assert.ok(mod.PV_SETUP_NAMES.includes('punto-venta-datos'));
        assert.ok(mod.PV_SETUP_NAMES.includes('punto-venta-items'));
    });

    await it('LOG_SETUP_NAMES should contain auth, datos-adicionales', async () => {
        assert.ok(Array.isArray(mod.LOG_SETUP_NAMES), 'LOG_SETUP_NAMES debe ser un array');
        assert.strictEqual(mod.LOG_SETUP_NAMES.length, 2, 'debe tener 2 elementos');
        assert.ok(mod.LOG_SETUP_NAMES.includes('auth'));
        assert.ok(mod.LOG_SETUP_NAMES.includes('datos-adicionales'));
    });

    await it('SETUP_NAMES should be the combined union (backward compat)', async () => {
        assert.ok(Array.isArray(mod.SETUP_NAMES));
        const expected = [...mod.PV_SETUP_NAMES, ...mod.LOG_SETUP_NAMES];
        assert.strictEqual(mod.SETUP_NAMES.length, expected.length);
        for (const name of expected) {
            assert.ok(mod.SETUP_NAMES.includes(name), `SETUP_NAMES debe incluir ${name}`);
        }
    });

    console.log('  ── detectEnvironmentGroup() ──');

    await it('should return "prd" when APP_ENV is "prd"', async () => {
        cleanupEnv();
        process.env.APP_ENV = 'prd';
        assert.strictEqual(mod.detectEnvironmentGroup(), 'prd');
    });

    await it('should return "crt-group" when APP_ENV is "crt"', async () => {
        cleanupEnv();
        process.env.APP_ENV = 'crt';
        assert.strictEqual(mod.detectEnvironmentGroup(), 'crt-group');
    });

    await it('should return "crt-group" when APP_ENV is "crt-3"', async () => {
        cleanupEnv();
        process.env.APP_ENV = 'crt-3';
        assert.strictEqual(mod.detectEnvironmentGroup(), 'crt-group');
    });

    await it('should return "crt-group" when APP_ENV is "crt-4"', async () => {
        cleanupEnv();
        process.env.APP_ENV = 'crt-4';
        assert.strictEqual(mod.detectEnvironmentGroup(), 'crt-group');
    });

    console.log('  ── detectEnvironmentFine() ──');

    await it('should return "crt" when APP_ENV is "crt" (fine)', async () => {
        cleanupEnv();
        process.env.APP_ENV = 'crt';
        assert.strictEqual(mod.detectEnvironmentFine(), 'crt');
    });

    await it('should return "crt-4" when APP_ENV is "crt-4" (fine)', async () => {
        cleanupEnv();
        process.env.APP_ENV = 'crt-4';
        assert.strictEqual(mod.detectEnvironmentFine(), 'crt-4');
    });

    await it('should return "prd" when APP_ENV is "prd" (fine)', async () => {
        cleanupEnv();
        process.env.APP_ENV = 'prd';
        assert.strictEqual(mod.detectEnvironmentFine(), 'prd');
    });

    console.log('  ── detectAccount() ──');

    await it('should export detectAccount as a function', async () => {
        assert.strictEqual(typeof mod.detectAccount, 'function');
    });

    await it('should return a non-empty string (reads from env.userEmail)', async () => {
        const account = mod.detectAccount();
        assert.strictEqual(typeof account, 'string');
        assert.ok(account.length > 0, 'debe retornar un email o "unknown"');
        
        assert.strictEqual(account, account.toLowerCase(), 'debe estar en lowercase');
    });

    console.log('  ── areAllSetupsComplete(module?) ──');

    await it('should export areAllSetupsComplete function', async () => {
        assert.strictEqual(typeof mod.areAllSetupsComplete, 'function');
    });

    await it('should accept optional module parameter (pv | logistica | undefined) and return false without state', async () => {
        cleanupEnv();
        process.env.APP_ENV = 'crt';
        process.env.USER_EMAIL = 'test@test.com';
        
        assert.strictEqual(mod.areAllSetupsComplete(), false);
        assert.strictEqual(mod.areAllSetupsComplete('pv'), false);
        assert.strictEqual(mod.areAllSetupsComplete('logistica'), false);
    });

    console.log('  ── getSetupStateSummary() ──');

    await it('should display per-module completion status with all setup names', async () => {
        cleanupEnv();
        process.env.APP_ENV = 'prd';
        process.env.USER_EMAIL = 'test@test.com';
        
        const mod2 = await import('@utils/setup-state');
        const summary = mod2.getSetupStateSummary();
        assert.ok(summary.includes('Ambiente:'), 'Debe mostrar Ambiente');
        assert.ok(summary.includes('Cuenta:'), 'Debe mostrar Cuenta');
        assert.ok(summary.includes('[PuntoVenta]'), 'Debe tener seccion PuntoVenta');
        assert.ok(summary.includes('[Logistica]'), 'Debe tener seccion Logistica');
        assert.ok(summary.includes('auth'));
        assert.ok(summary.includes('punto-venta-datos'));
        assert.ok(summary.includes('punto-venta-items'));
        assert.ok(summary.includes('datos-adicionales'));
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
