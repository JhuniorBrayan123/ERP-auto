import { test as base, expect } from '@playwright/test';
import { Cajero } from '@actors/cajero';
import { CajaPage } from '@pages/PuntoVenta/CajaPage';
import { PuntoVentaNavigationPage } from '@pages/PuntoVenta/PuntoVentaNavigationPage';
import { AsegurarVistaFacturacion } from '@screenplay/tasks/facturacion/ConfigurarVistaFacturacion';
import { CAJAS } from '@helpers/PuntoVenta/emision-data.helper';
import { EmisionPage } from '@pages/PuntoVenta/EmisionPage';
import {esperarCargaOverlay} from "@utils/wait-helpers";

type FacturacionFixtures = {
    cajero: Cajero;
        vistaFacturacionLista: void;
};

export const test = base.extend<FacturacionFixtures>({

    cajero: async ({ page, vistaFacturacionLista: _ }, use) => {
        await use(Cajero.con(page));
    },

    vistaFacturacionLista: [async ({ page }, use) => {

        const pvNav = new PuntoVentaNavigationPage(page);
        await page.goto('/');
        await esperarCargaOverlay(page);
        await pvNav.navegarAPuntoDeVenta();
        const cajaPage = new CajaPage(page, CAJAS.VENTA.nombre);
        await cajaPage.asegurarCajaAbierta();
        await AsegurarVistaFacturacion()(page);
        await use();

        const emisionPage = new EmisionPage(page);
        const btnNuevaVenta = page.getByRole('button', { name: 'Nueva Venta' });
        if (await btnNuevaVenta.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await btnNuevaVenta.click({ timeout: 3_000, force: true }).catch(() => {});
        }
    }, { auto: true }],
});

export { expect } from '@playwright/test';
