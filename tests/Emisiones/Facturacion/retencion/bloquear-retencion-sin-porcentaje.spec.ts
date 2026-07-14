import { expect, test } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('FC-17 | Bloquear retención sin porcentaje', { tag: ['@facturacion', '@retencion'] }, () => {

    test('SC-01: Bloquear la emisión con retención cuando no se ingresa un porcentaje @FC-17.1', async ({ page, cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYSeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
        );

        await BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL)(page);

        await FacturacionTargets.sliderRetencion(page).click({ force: true });
        await page.waitForTimeout(5000);

        const inputRetencion = FacturacionTargets.inputPorcentajeRetencion(page);
        await inputRetencion.waitFor({ state: 'visible', timeout: 5000 });
        await inputRetencion.fill('');
        await expect(inputRetencion).toHaveValue('0');
        await page.getByRole('button', { name: 'PAGAR' }).click();

        await expect(page.getByText(
            'Para emitir un comprobante con retención debes ingresar un porcentaje'
        )).toBeVisible();
    });
});
