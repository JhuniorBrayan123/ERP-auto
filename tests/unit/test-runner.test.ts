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

function cleanupSkips(): void {
    delete process.env.SKIP_PV_SETUP;
    delete process.env.SKIP_PV_ITEMS_SETUP;
    delete process.env.SKIP_DATOS_SETUP;
}

async function main(): Promise<void> {
    console.log('\n=== test-runner.ts — Unit Tests ===\n');

    let applySetupSelections: (selected: string[]) => void;

    try {
        const mod = await import('../../scripts/test-runner');
        applySetupSelections = mod.applySetupSelections;
    } catch {
        console.log('  (Module not yet exported — waiting for implementation)\n');
        applySetupSelections = () => {};
    }

    console.log('  ── applySetupSelections() ──');

    await it('should clear SKIP_PV_SETUP and SKIP_PV_ITEMS_SETUP when auth and pv-items selected', async () => {
        cleanupSkips();
        
        process.env.SKIP_PV_SETUP = '1';
        process.env.SKIP_PV_ITEMS_SETUP = '1';
        process.env.SKIP_DATOS_SETUP = '1';

        applySetupSelections(['auth', 'punto-venta-items']);

        assert.strictEqual(process.env.SKIP_PV_SETUP, undefined, 'SKIP_PV_SETUP debe eliminarse (auth seleccionado)');
        assert.strictEqual(process.env.SKIP_PV_ITEMS_SETUP, undefined, 'SKIP_PV_ITEMS_SETUP debe eliminarse');
        assert.strictEqual(process.env.SKIP_DATOS_SETUP, '1', 'SKIP_DATOS_SETUP debe seguir en 1');
    });

    await it('should set SKIP_DATOS_SETUP when datos-adicionales not selected', async () => {
        cleanupSkips();
        applySetupSelections(['auth', 'punto-venta-datos', 'punto-venta-items']);
        assert.strictEqual(process.env.SKIP_DATOS_SETUP, '1', 'datos-adicionales no seleccionado → SKIP_DATOS_SETUP=1');
        assert.strictEqual(process.env.SKIP_PV_SETUP, undefined, 'auth o pv-datos seleccionado → SKIP_PV_SETUP eliminado');
    });

    await it('should delete ALL SKIP_* when all setups selected', async () => {
        cleanupSkips();
        applySetupSelections(['auth', 'punto-venta-datos', 'punto-venta-items', 'datos-adicionales']);
        assert.strictEqual(process.env.SKIP_PV_SETUP, undefined);
        assert.strictEqual(process.env.SKIP_PV_ITEMS_SETUP, undefined);
        assert.strictEqual(process.env.SKIP_DATOS_SETUP, undefined);
    });

    await it('should set ALL SKIP_* when empty array passed', async () => {
        cleanupSkips();
        applySetupSelections([]);
        assert.strictEqual(process.env.SKIP_PV_SETUP, '1');
        assert.strictEqual(process.env.SKIP_PV_ITEMS_SETUP, '1');
        assert.strictEqual(process.env.SKIP_DATOS_SETUP, '1');
    });

    await it('should set SKIP_PV_SETUP when only datos-adicionales selected', async () => {
        cleanupSkips();
        applySetupSelections(['datos-adicionales']);
        assert.strictEqual(process.env.SKIP_PV_SETUP, '1', 'auth no seleccionado → SKIP_PV_SETUP=1');
        assert.strictEqual(process.env.SKIP_PV_ITEMS_SETUP, '1', 'pv-items no seleccionado → SKIP_PV_ITEMS_SETUP=1');
        assert.strictEqual(process.env.SKIP_DATOS_SETUP, undefined, 'datos-adicionales seleccionado → SKIP_DATOS_SETUP eliminado');
    });

    await it('should handle combined SKIP_PV_SETUP (auth+pv-datos share same env var)', async () => {
        cleanupSkips();
        
        applySetupSelections(['auth']);
        assert.strictEqual(process.env.SKIP_PV_SETUP, undefined, 'auth → SKIP_PV_SETUP eliminado');
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
