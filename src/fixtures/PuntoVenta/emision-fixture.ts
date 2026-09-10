import {test as base} from '@playwright/test';
import {PuntoVentaNavigationPage} from '@pages/PuntoVenta/PuntoVentaNavigationPage';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {EmisionDatosOpcionalesPage} from '@pages/PuntoVenta/EmisionDatosOpcionalesPage';
import {EmisionAdelantosPage} from '@pages/PuntoVenta/EmisionAdelantosPage';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';
import {ClientePage} from '@pages/PuntoVenta/ClientePage';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import {ComprobanteDetallePage} from '@pages/PuntoVenta/ComprobanteDetallePage';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/busqueda-comprobantes';
import {PrecuentaPage} from '@pages/PuntoVenta/PrecuentaPage';
import {DetraccionPage} from "@pages/PuntoVenta/detraccion.page";
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import {PedidoListaPage} from '@pages/PuntoVenta/PedidoListaPage';
import {CotizacionOpcionesPage} from '@pages/PuntoVenta/CotizacionOpcionesPage';

type EmisionFixtures = {
    pvNav: PuntoVentaNavigationPage;
    emisionPage: EmisionPage;
    emisionDatosOpcionalesPage: EmisionDatosOpcionalesPage;
    emisionAdelantosPage: EmisionAdelantosPage;
    cajaPage: CajaPage;
    clientePage: ClientePage;
    comprobantePage: ComprobantePage;
    comprobanteDetalle: ComprobanteDetallePage;
    busquedaComprobantes: BusquedaComprobantesPage;
    precuentaPage: PrecuentaPage;
    detraccionPage: DetraccionPage;
    postEmisionPage: PostEmisionPage;
    pedidoListaPage: PedidoListaPage;
    cotizacionOpcionesPage: CotizacionOpcionesPage;
};

export const test = base.extend<EmisionFixtures>({
    pvNav: [async ({page}, use) => {
        const nav = new PuntoVentaNavigationPage(page);
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await nav.navegarAPuntoDeVenta();
        await use(nav);
    }, {auto: true}],

    emisionPage: async ({page}, use) => {
        await use(new EmisionPage(page));
    },

    emisionDatosOpcionalesPage: async ({page}, use) => {
        await use(new EmisionDatosOpcionalesPage(page));
    },

    emisionAdelantosPage: async ({page}, use) => {
        await use(new EmisionAdelantosPage(page));
    },

    cajaPage: async ({page}, use) => {
        await use(new CajaPage(page));
    },

    clientePage: async ({page}, use) => {
        await use(new ClientePage(page));
    },

    comprobantePage: async ({page}, use) => {
        await use(new ComprobantePage(page));
    },

    comprobanteDetalle: async ({page}, use) => {
        await use(new ComprobanteDetallePage(page));
    },

    busquedaComprobantes: async ({page}, use) => {
        await use(new BusquedaComprobantesPage(page));
    },

    precuentaPage: async ({page}, use) => {
        await use(new PrecuentaPage(page));
    },
    detraccionPage: async ({page}, use) => {
        await use(new DetraccionPage(page));
    },
    postEmisionPage: async ({page}, use) => {
        await use(new PostEmisionPage(page));
    },
    pedidoListaPage: async ({page}, use) => {
        await use(new PedidoListaPage(page));
    },
    cotizacionOpcionesPage: async ({page}, use) => {
        await use(new CotizacionOpcionesPage(page));
    }
});

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

export {expect} from '@playwright/test';
