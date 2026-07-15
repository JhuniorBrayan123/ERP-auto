import { test as base, expect } from '@playwright/test';
import { Cajero } from '@actors/cajero';
import { CajaPage } from '@pages/PuntoVenta/CajaPage';
import { PuntoVentaNavigationPage } from '@pages/PuntoVenta/PuntoVentaNavigationPage';
import { AsegurarVistaFacturacion } from '@screenplay/tasks/facturacion/ConfigurarVistaFacturacion';
import { CAJAS } from '@helpers/PuntoVenta/emision-data.helper';
import { UsarNavegador } from '@abilities/usarnavegador';

/**
 * Fixture para tests de Cotización y Pedido desde Vista Facturación.
 * - Reutiliza el mismo flujo de facturacion.fixture (caja + vista facturación)
 * - Provee un actor `vendedor` con nombre semántico (internamente es Cajero)
 * - AsegurarVistaFacturacion() activa la vista SIN guardar en DB
 */
type CotizacionPedidoFixtures = {
    vendedor: Cajero;
    vistaFacturacionLista: void;
};

export const test = base.extend<CotizacionPedidoFixtures>({

    vendedor: async ({ page, vistaFacturacionLista: _ }, use) => {
        await use(Cajero.llamado('Vendedor').quienPuede(UsarNavegador.con(page)));
    },

    vistaFacturacionLista: [async ({ page }, use) => {
        // 1. Navegar a PV
        const pvNav = new PuntoVentaNavigationPage(page);
        await page.goto('/');
        await pvNav.navegarAPuntoDeVenta();

        // 2. Abrir caja
        const cajaPage = new CajaPage(page, CAJAS.VENTA.nombre);
        await cajaPage.asegurarCajaAbierta();

        // 3. Asegurar Vista Facturación activa (SIN guardar en DB)
        await AsegurarVistaFacturacion()(page);

        await use();

        // Teardown: limpiar estado si quedó algo pendiente
        const btnNuevaVenta = page.getByRole('button', { name: 'Nueva Venta' });
        if (await btnNuevaVenta.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await btnNuevaVenta.click({ timeout: 3_000, force: true }).catch(() => {});
        }
    }, { auto: true }],
});

export { expect } from '@playwright/test';
