import {expect} from '@playwright/test';
import {test as validacionTest} from './validacion-fixture';
import {Facturador} from '@actors/facturador';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import type {KardexApi} from '@services/Logistica/KardexApi';

type ComprobanteNCNDFixtures = {
    facturador: Facturador;
    busquedaComprobantes: BusquedaComprobantesPage;
    postEmision: PostEmisionPage;
    kardexApi: KardexApi;
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
});

// Asegurar caja abierta antes de cada test (el pvNav auto del fixture padre ya navegó a POS)
test.beforeEach(async ({cajaPage}) => {
    await cajaPage.asegurarCajaAbierta();
});

test.afterEach(async ({}, testInfo) => {
    const status = testInfo.status === 'passed' ? '✓ PASS' : '✗ FAIL';
    const duracion = ((testInfo.duration ?? 0) / 1000).toFixed(1);
    const mensaje = `${status}: ${testInfo.title} (${duracion}s)`;

    if (testInfo.status !== 'passed' && testInfo.error) {
        console.error(`${mensaje} → ${testInfo.error.message}`);
    } else {
        console.log(mensaje);
    }
});

export {expect};
