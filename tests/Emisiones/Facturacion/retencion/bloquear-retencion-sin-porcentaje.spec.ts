import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Facturación — Bloquear retención sin porcentaje', () => {

    test('Bloquea la emisión con retención cuando no se ingresa un porcentaje', async ({ page, cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYSeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
        );

        await FacturacionTargets.sliderRetencion(page).click({ force: true });

        await BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL)(page);

        await page.getByRole('button', { name: 'PAGAR' }).click();

        await expect(page.locator('body')).toContainText(
            'Para emitir un comprobante con retención debes ingresar un porcentaje'
        );
    });
});
