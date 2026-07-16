import { test as base, expect } from '@playwright/test';
import { Cajero } from '@actors/cajero';
import { CajaPage } from '@pages/PuntoVenta/CajaPage';
import { PuntoVentaNavigationPage } from '@pages/PuntoVenta/PuntoVentaNavigationPage';
import { AsegurarVistaFacturacion } from '@screenplay/tasks/facturacion/ConfigurarVistaFacturacion';
import { CAJAS } from '@helpers/PuntoVenta/emision-data.helper';
import { UsarNavegador } from '@abilities/usarnavegador';

type CotizacionPedidoFixtures = {
    vendedor: Cajero;
    vistaFacturacionLista: void;
};

export const test = base.extend<CotizacionPedidoFixtures>({

    vendedor: async ({ page, vistaFacturacionLista: _ }, use) => {
        await use(Cajero.llamado('Vendedor').quienPuede(UsarNavegador.con(page)));
    },

    vistaFacturacionLista: [async ({ page }, use) => {
        
        const pvNav = new PuntoVentaNavigationPage(page);
        await page.goto('/');
        await pvNav.navegarAPuntoDeVenta();

        
        const cajaPage = new CajaPage(page, CAJAS.VENTA.nombre);
        await cajaPage.asegurarCajaAbierta();

        
        await AsegurarVistaFacturacion()(page);

        await use();

        
        const btnNuevaVenta = page.getByRole('button', { name: 'Nueva Venta' });
        if (await btnNuevaVenta.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await btnNuevaVenta.click({ timeout: 3_000, force: true }).catch(() => {});
        }
    }, { auto: true }],
});

export { expect } from '@playwright/test';
