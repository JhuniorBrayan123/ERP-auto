import {expect} from '@playwright/test';
import {test as validacionTest} from './validacion-fixture';
import {Facturador} from '@actors/facturador';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import type {KardexApi} from '@services/Logistica/KardexApi';
import {EliminarNotaVinculada} from '@screenplay/tasks/common/EliminarNotaVinculada';
import {liberarSeed, limpiarReclamos, reclamosEnProceso} from '@factories/comprobante-recurrente-factory';
import {detectAccount, detectEnvironmentGroup} from '@utils/setup-state';

type ComprobanteNCNDFixtures = {
    facturador: Facturador;
    busquedaComprobantes: BusquedaComprobantesPage;
    postEmision: PostEmisionPage;
    kardexApi: KardexApi;
    notasCreadas: string[];
    registrarNota: (numero: string) => void;
};

export const test = validacionTest.extend<ComprobanteNCNDFixtures>({
    facturador: async ({page}, use) => {
        await use(Facturador.con(page));
    },

    busquedaComprobantes: async ({page}, use) => {
        await use(new BusquedaComprobantesPage(page));
    },

    postEmision: async ({page}, use) => {
        await use(new PostEmisionPage(page));
    },

    notasCreadas: async ({}, use) => {
        await use([]);
    },

    registrarNota: async ({notasCreadas}, use) => {
        await use((numero: string) => {
            notasCreadas.push(numero);
        });
    },
});


test.beforeEach(async ({cajaPage}) => {
    await cajaPage.asegurarCajaAbierta();
    limpiarReclamos();
});

test.afterEach(async ({page, notasCreadas}, testInfo) => {
    const status = testInfo.status === 'passed' ? '✓ PASS' : '✗ FAIL';
    const duracion = ((testInfo.duration ?? 0) / 1000).toFixed(1);
    const mensaje = `${status}: ${testInfo.title} (${duracion}s)`;

    if (testInfo.status !== 'passed' && testInfo.error) {
        console.error(`${mensaje} → ${testInfo.error.message}`);
    } else {
        console.log(mensaje);
    }

    const facturador = Facturador.con(page);
    let eliminacionFallo = false;
    for (const numero of notasCreadas) {
        try {
            await facturador.realiza(EliminarNotaVinculada(numero));
        } catch (e) {
            eliminacionFallo = true;
            console.warn(`[comprobante-nc-nd.fixture] No se pudo eliminar la nota ${numero}: ${(e as Error).message}`);
        }
    }

    // Fail-closed: a failed deletion leaves the reclaimed seed(s) as
    // vinculado:true too — the next run self-heals with a fresh replacement
    // instead of reusing a seed whose linked NC/ND may still exist.
    if (eliminacionFallo) {
        return;
    }

    const envGroup = detectEnvironmentGroup();
    const account = detectAccount();
    for (const tipo of reclamosEnProceso()) {
        try {
            liberarSeed(tipo, envGroup, account);
        } catch {
            // stays vinculado:true on failure — same fail-closed rationale.
        }
    }
});

export {expect};
