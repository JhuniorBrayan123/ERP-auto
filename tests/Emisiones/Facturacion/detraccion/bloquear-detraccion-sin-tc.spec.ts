import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { SeleccionarMoneda } from '@screenplay/interactions/facturacion/SeleccionarMoneda';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Facturación — Bloquear detracción sin tipo de cambio', () => {

    test('Bloquea emisión de factura con detracción en moneda extranjera sin tipo de cambio', async ({ page, cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYSeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
            SeleccionarMoneda('dolares'),
        );

        await FacturacionTargets.sliderDetraccion(page).click({ force: true });

        await BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL)(page);

        await page.getByRole('button', { name: 'PAGAR' }).click();

        await expect(page.locator('body')).toContainText('Falta tipo de cambio en detracción');
    });
});
