import {strict as assert} from 'node:assert';
import {buildFallbackFailureSummary} from '../../src/utils/functional-error';

let passed = 0;
let failed = 0;

function it(name: string, fn: () => void): void {
    try {
        fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (e) {
        failed++;
        const msg = (e as Error).message.split('\n')[0];
        console.log(`  ✗ ${name} — ${msg}`);
    }
}

async function main(): Promise<void> {
    console.log('\n=== src/utils/functional-error.ts — buildFallbackFailureSummary — Unit Tests ===\n');

    console.log('  ── buildFallbackFailureSummary (fallback sin meta funcional) ──');

    it('aserción plana con mensaje custom → userMessage real y categoría DATOS', () => {
        const raw = [
            'Error: La cotización 137 debería mostrar Facturado="SI" tras convertir desde detalle. Valores encontrados: ["No"]',
            '',
            'expect(received).toBe(expected) // Object.is equality',
            '',
            'Expected: true',
            'Received: false',
            '    at validarFacturadoSi (tests\\Emisiones\\Facturacion\\cotizacion\\FC-CT-convertir-detalle.spec.ts:54:7)',
        ].join('\n');

        const summary = buildFallbackFailureSummary({
            testTitle: 'FC-CT convertir detalle',
            rawMessage: raw,
            status: 'failed',
            failedStep: 'Convertir desde detalle',
        });

        assert.strictEqual(summary.caseName, 'FC-CT convertir detalle');
        assert.ok(summary.userMessage.includes('La cotización 137 debería mostrar Facturado="SI"'), 'debe conservar el mensaje custom');
        assert.ok(summary.userMessage.includes('Expected: true | Received: false'), 'debe incluir los valores esperado/recibido');
        assert.strictEqual(summary.failureCategory, 'DATOS');
    });

    it('rawMessage vacío + status failed → userMessage genérico y categoría DESCONOCIDO', () => {
        const summary = buildFallbackFailureSummary({
            testTitle: 'Caso sin detalle',
            rawMessage: '',
            status: 'failed',
            failedStep: 'Paso no identificado',
        });

        assert.strictEqual(summary.userMessage, 'Ocurrió un error durante el flujo y no se pudo completar el paso esperado.');
        assert.strictEqual(summary.failureCategory, 'DESCONOCIDO');
    });

    it('status timedOut con mensaje de timeout → categoría AMBIENTE y mensaje real', () => {
        const raw = 'Error: locator.click: Timeout 30000ms exceeded.\nCall log:\n  - waiting for locator("button")';

        const summary = buildFallbackFailureSummary({
            testTitle: 'Caso con timeout',
            rawMessage: raw,
            status: 'timedOut',
            failedStep: 'Hacer clic en el botón',
        });

        assert.strictEqual(summary.failureCategory, 'AMBIENTE');
        assert.notStrictEqual(summary.userMessage, 'Ocurrió un error durante el flujo y no se pudo completar el paso esperado.');
        assert.ok(summary.userMessage.includes('Timeout 30000ms'), 'debe conservar el mensaje real del timeout');
    });

    it('error de locator con call log → mensaje real (sin genérico) y categoría AMBIENTE (timeout tiene prioridad)', () => {
        const raw = 'expect(locator).toBeVisible() failed\nCall log:\n  - expect(locator).toBeVisible() with timeout 30000ms';

        const summary = buildFallbackFailureSummary({
            testTitle: 'Caso con locator',
            rawMessage: raw,
            status: 'failed',
            failedStep: 'Verificar elemento visible',
        });

        assert.strictEqual(summary.userMessage, 'expect(locator).toBeVisible() failed', 'debe conservar el mensaje real del error');
        assert.ok(!summary.userMessage.includes('Ocurrió un error durante el flujo'), 'no debe usar el mensaje genérico');
        assert.strictEqual(summary.failureCategory, 'AMBIENTE', 'con "with timeout", el patrón timeout (AMBIENTE) tiene prioridad sobre toBeVisible');
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
