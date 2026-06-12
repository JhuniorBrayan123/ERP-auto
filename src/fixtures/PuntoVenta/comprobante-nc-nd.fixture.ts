import {expect, test as base} from '@playwright/test';
import {Facturador} from '@actors/facturador';
import {PuntoVentaNavigationPage} from '@pages/PuntoVenta/PuntoVentaNavigationPage';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';
import {KardexApi} from "@services/Logistica/KardexApi";

type ComprobanteNCNDFixtures = {
    facturador: Facturador;
    pvNav: PuntoVentaNavigationPage;
    busquedaComprobantes: BusquedaComprobantesPage;
    postEmision: PostEmisionPage;
    kardexApi: KardexApi;
};

export const test = base.extend<ComprobanteNCNDFixtures>({
    pvNav: [
        async ({page}, use) => {
            const nav = new PuntoVentaNavigationPage(page);
            await page.goto('/');
            await nav.navegarAPuntoDeVenta();
            const cajaPage = new CajaPage(page, 'caja-auto');
            await cajaPage.asegurarCajaAbierta();
            await use(nav);
        },
        {auto: true},
    ],

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
