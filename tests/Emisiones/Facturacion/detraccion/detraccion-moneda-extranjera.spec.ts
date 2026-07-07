import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { SeleccionarMoneda } from '@screenplay/interactions/facturacion/SeleccionarMoneda';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import { VentaGridTargets } from '@screenplay/targets/facturacion/VentaGridTargets';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';
import { DetraccionPage } from '@pages/PuntoVenta/detraccion.page';

test.describe('Facturación — Detracción moneda extranjera', () => {

    test('Emite factura con detracción en dólares y tipo de cambio', async ({ page, cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYSeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
            SeleccionarMoneda('dolares'),
        );

        await FacturacionTargets.sliderDetraccion(page).click({ force: true });
        await expect(page.getByText('Tipo de cambio de detracción')).toBeVisible({ timeout: 5_000 });

        const inputTC = page.getByRole('textbox', { name: 'Cambio' }).or(page.getByRole('textbox', { name: '0' }));
        if (await inputTC.isVisible().catch(() => false)) {
            await inputTC.fill('3.85');
        }

        await FacturacionTargets.btnEditarDetraccion(page).click();
        const detraccionPage = new DetraccionPage(page);
        await detraccionPage.configurarDetraccionSimple({ porcentaje: '10', numeroCuenta: '11282847580' });

        await page.getByRole('button', { name: 'Actualizar' }).click();
        await page.locator('.v-modal > div').first().click();

        await BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL)(page);
        await VentaGridTargets.btnEditarItem(page, 0).click();
        await VentaGridTargets.inputPrecioFinal(page, 0).fill('250');
        await VentaGridTargets.btnAceptarEdicion(page, 0).click();

        await page.getByRole('button', { name: 'PAGAR' }).click();
        await page.getByRole('button', { name: 'Monto exacto' }).click();
        await page.getByRole('button', { name: 'Realizar Pago' }).click();

        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible({ timeout: 15_000 });
        await expect(page.locator('body')).toContainText(/F001-\d{8}/);
    });
});
