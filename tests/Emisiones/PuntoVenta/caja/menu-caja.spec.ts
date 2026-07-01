
import { expect } from '@playwright/test';
import { test } from '@fixtures/PuntoVenta/caja.fixture';
import { AbrirMenuCaja, RegresarANuevaVenta } from '@screenplay/tasks/caja/AbrirMenuCaja';
import { MenuCajaTargets } from '@screenplay/targets/caja/MenuCajaTargets';
import { UsarNavegador } from '@abilities/usarnavegador';

test.describe('Menú lateral de Caja', () => {

    test('validar apertura del menú lateral y opciones de movimientos de dinero', async ({ cajero }) => {
        
        await cajero.realiza(AbrirMenuCaja());

        
        const page = cajero.habilidad(UsarNavegador).page;

        await expect(MenuCajaTargets.opcionIngresoDinero(page)).toContainText('Ingreso de dinero');
        await expect(MenuCajaTargets.opcionEgresoDinero(page)).toContainText('Egreso de dinero');
        await expect(MenuCajaTargets.opcionPagos(page)).toContainText('Pagos');
        await expect(MenuCajaTargets.opcionCobros(page)).toContainText('Cobros');

        
        await cajero.realiza(RegresarANuevaVenta());
    });

    test('validar opciones de comprobantes y módulos disponibles en el menú', async ({ cajero }) => {
        
        await cajero.realiza(AbrirMenuCaja());

        
        const page = cajero.habilidad(UsarNavegador).page;

        await expect(page.locator('body')).toContainText('Nueva venta');
        await expect(page.locator('body')).toContainText('Cierre de caja');
        await expect(page.locator('body')).toContainText('Búsqueda de comprobantes');
        await expect(page.locator('body')).toContainText('Anular comprobante');
        await expect(page.locator('body')).toContainText('Nota de Débito');
        await expect(page.locator('body')).toContainText('Nota de Crédito');

        
        await cajero.realiza(RegresarANuevaVenta());
    });
});
