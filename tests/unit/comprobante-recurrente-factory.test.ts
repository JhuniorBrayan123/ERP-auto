import {strict as assert} from 'node:assert';
import {existsSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

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

const CACHE_DIR = resolve(process.cwd(), 'playwright', '.auth', 'cache');
const ENV_GROUP = 'unit-test-group';
const ACCOUNT = 'unit-test@erp2.local';

function limpiarArchivoCache(): void {
    const ruta = resolve(CACHE_DIR, `seed-comprobantes.${ENV_GROUP}__${ACCOUNT.replace(/@/g, '_at_')}.json`);
    if (existsSync(ruta)) {
        rmSync(ruta);
    }
}

async function main(): Promise<void> {
    console.log('\n=== comprobante-recurrente-factory.ts — Unit Tests ===\n');

    const mod = await import('@factories/comprobante-recurrente-factory.js');
    const itemFactory = await import('@factories/item-factory.js');

    await it('rutaCacheSeeds produces a path distinct from item-factory\'s item cache (no clobbering)', async () => {
        const rutaSeeds = mod.rutaCacheSeeds(ENV_GROUP, ACCOUNT);
        const rutaItems = itemFactory.rutaCache(ENV_GROUP, ACCOUNT);
        assert.notStrictEqual(rutaSeeds, rutaItems, 'el cache de seeds nunca debe escribir sobre el cache de items');
    });

    await it('cargarSeeds returns null on cache miss (no file yet)', async () => {
        limpiarArchivoCache();
        const resultado = mod.cargarSeeds(ENV_GROUP, ACCOUNT);
        assert.strictEqual(resultado, null);
    });

    await it('guardarSeeds then cargarSeeds round-trips the exact written entry', async () => {
        limpiarArchivoCache();
        const cache = {
            boleta: {
                serie: 'B001',
                correlativo: '123',
                comprobanteId: 999,
                numero: 'B001-00000123',
                vinculado: false,
                emitidoEn: '2026-09-10T00:00:00.000Z',
            },
        };
        mod.guardarSeeds(cache, ENV_GROUP, ACCOUNT);
        const leido = mod.cargarSeeds(ENV_GROUP, ACCOUNT);
        assert.deepStrictEqual(leido, cache);
        limpiarArchivoCache();
    });

    await it('cargarSeeds returns null silently on corrupt JSON (does not throw)', async () => {
        limpiarArchivoCache();
        if (!existsSync(CACHE_DIR)) {
            mkdirSync(CACHE_DIR, {recursive: true});
        }
        const rutaReal = mod.rutaCacheSeeds(ENV_GROUP, ACCOUNT);
        writeFileSync(rutaReal, '{not valid json', 'utf-8');
        const resultado = mod.cargarSeeds(ENV_GROUP, ACCOUNT);
        assert.strictEqual(resultado, null);
        limpiarArchivoCache();
    });

    await it('registrarSeedNuevo writes vinculado:true for a fresh seed', async () => {
        limpiarArchivoCache();
        mod.limpiarReclamos();
        mod.registrarSeedNuevo('BOLETA', {
            serie: 'B001',
            correlativo: '1',
            comprobanteId: 1,
            numero: 'B001-00000001',
        }, ENV_GROUP, ACCOUNT);

        const cache = mod.cargarSeeds(ENV_GROUP, ACCOUNT);
        assert.ok(cache, 'debe haber escrito el archivo de cache');
        assert.strictEqual(cache!.boleta?.vinculado, true);
        limpiarArchivoCache();
    });

    await it('reclamarSeed flips an existing entry to vinculado:true and tracks it in reclamosEnProceso', async () => {
        limpiarArchivoCache();
        mod.limpiarReclamos();
        mod.guardarSeeds({
            factura: {
                serie: 'F001',
                correlativo: '5',
                comprobanteId: 5,
                numero: 'F001-00000005',
                vinculado: false,
                emitidoEn: '2026-09-10T00:00:00.000Z',
            },
        }, ENV_GROUP, ACCOUNT);

        mod.reclamarSeed('FACTURA', ENV_GROUP, ACCOUNT);

        const cache = mod.cargarSeeds(ENV_GROUP, ACCOUNT);
        assert.strictEqual(cache!.factura?.vinculado, true);
        assert.deepStrictEqual(mod.reclamosEnProceso(), ['FACTURA']);
        limpiarArchivoCache();
    });

    await it('liberarSeed flips vinculado back to false, persisting the release', async () => {
        limpiarArchivoCache();
        mod.limpiarReclamos();
        mod.registrarSeedNuevo('BOLETA', {
            serie: 'B002',
            correlativo: '2',
            comprobanteId: 2,
            numero: 'B002-00000002',
        }, ENV_GROUP, ACCOUNT);

        mod.liberarSeed('BOLETA', ENV_GROUP, ACCOUNT);

        const cache = mod.cargarSeeds(ENV_GROUP, ACCOUNT);
        assert.strictEqual(cache!.boleta?.vinculado, false);
        limpiarArchivoCache();
    });

    await it('limpiarReclamos resets reclamosEnProceso to empty', async () => {
        limpiarArchivoCache();
        mod.limpiarReclamos();
        mod.registrarSeedNuevo('FACTURA', {
            serie: 'F002',
            correlativo: '9',
            comprobanteId: 9,
            numero: 'F002-00000009',
        }, ENV_GROUP, ACCOUNT);

        assert.deepStrictEqual(mod.reclamosEnProceso(), ['FACTURA']);
        mod.limpiarReclamos();
        assert.deepStrictEqual(mod.reclamosEnProceso(), []);
        limpiarArchivoCache();
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
