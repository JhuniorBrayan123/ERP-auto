/**
 * Fixture principal para tests de emisión en PuntoVenta.
 *
 * Inyecta page objects pre-instanciados y navega al módulo PdV.
 * Análogo a items-fixture.ts de Logística.
 *
 * Uso: tests que solo necesitan UI (sin validaciones API).
 * Para tests con SUNAT/stock, usar validacion-fixture.ts que extiende esta.
 */
import { test as base } from '@playwright/test';
import { PuntoVentaNavigationPage } from '../../pages/PuntoVenta/PuntoVentaNavigationPage';
import { EmisionPage } from '../../pages/PuntoVenta/EmisionPage';
import { CajaPage } from '../../pages/PuntoVenta/CajaPage';
import { ClientePage } from '../../pages/PuntoVenta/ClientePage';
import { ComprobantePage } from '../../pages/PuntoVenta/ComprobantePage';
import { ComprobanteDetallePage } from '../../pages/PuntoVenta/ComprobanteDetallePage';
import { BusquedaComprobantesPage } from '../../pages/PuntoVenta/BusquedaComprobantesPage';
import { PrecuentaPage } from '../../pages/PuntoVenta/PrecuentaPage';

type EmisionFixtures = {
    pvNav: PuntoVentaNavigationPage;
    emisionPage: EmisionPage;
    cajaPage: CajaPage;
    clientePage: ClientePage;
    comprobantePage: ComprobantePage;
    comprobanteDetalle: ComprobanteDetallePage;
    busquedaComprobantes: BusquedaComprobantesPage;
    precuentaPage: PrecuentaPage;
};

export const test = base.extend<EmisionFixtures>({
    pvNav: [async ({ page }, use) => {
        const nav = new PuntoVentaNavigationPage(page);
        await page.goto('/');
        await nav.navegarAPuntoDeVenta();
        await use(nav);
    }, { auto: true }],

    emisionPage: async ({ page }, use) => {
        await use(new EmisionPage(page));
    },

    cajaPage: async ({ page }, use) => {
        await use(new CajaPage(page));
    },

    clientePage: async ({ page }, use) => {
        await use(new ClientePage(page));
    },

    comprobantePage: async ({ page }, use) => {
        await use(new ComprobantePage(page));
    },

    comprobanteDetalle: async ({ page }, use) => {
        await use(new ComprobanteDetallePage(page));
    },

    busquedaComprobantes: async ({ page }, use) => {
        await use(new BusquedaComprobantesPage(page));
    },

    precuentaPage: async ({ page }, use) => {
        await use(new PrecuentaPage(page));
    },
});

/**
 * afterEach hook: Imprime PASS/FAIL en consola tras cada test.
 * Mantiene consistencia con el patrón de Logística.
 */
test.afterEach(async ({}, testInfo) => {
    const status = testInfo.status === 'passed' ? ' PASS' : ' FAIL';
    const duracion = ((testInfo.duration ?? 0) / 1000).toFixed(1);
    const mensaje = `${status}: ${testInfo.title} (${duracion}s)`;

    if (testInfo.status !== 'passed' && testInfo.error) {
        console.log(`${mensaje} → ${testInfo.error.message}`);
    } else {
        console.log(mensaje);
    }
});

export { expect } from '@playwright/test';
