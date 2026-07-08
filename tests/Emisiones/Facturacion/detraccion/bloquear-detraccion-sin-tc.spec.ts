import {expect, test} from '@fixtures/PuntoVenta/facturacion.fixture';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {BuscarYSeleccionarCliente} from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import {SeleccionarMoneda} from '@screenplay/interactions/facturacion/SeleccionarMoneda';
import {BuscarYAgregarProducto} from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import {VentaGridTargets} from '@screenplay/targets/facturacion/VentaGridTargets';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

const DETRACCION_CHECKBOX_ID = 'pv_punto-venta_cmp-factura-boleta-header_v-switch:documento-detraccion';

const activarDetraccion = async (page: import('@playwright/test').Page): Promise<void> => {
    const isChecked = await page.evaluate((id) => {
        const el = document.getElementById(id) as HTMLInputElement;
        return el?.checked ?? false;
    }, DETRACCION_CHECKBOX_ID);

    if (!isChecked) {
        await page.evaluate((id) => {
            const el = document.getElementById(id) as HTMLInputElement;
            if (el && !el.checked) {
                el.checked = true;
                el.dispatchEvent(new Event('change', {bubbles: true}));
            }
        }, DETRACCION_CHECKBOX_ID);
        await page.waitForTimeout(500);
    }
};

test.describe('Facturación — Bloquear detracción sin tipo de cambio', () => {

    test('Bloquea emisión de factura con detracción en moneda extranjera sin tipo de cambio', async ({
                                                                                                         page,
                                                                                                         cajero
                                                                                                     }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYSeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
            SeleccionarMoneda('dolares'),
        );

        await activarDetraccion(page);

        await BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL)(page);

        
        
        await VentaGridTargets.btnEditarItem(page, 0).click();
        await VentaGridTargets.inputPrecioFinal(page, 0).fill('250');
        await VentaGridTargets.btnAceptarEdicion(page, 0).click();

        await page.getByRole('button', {name: 'PAGAR'}).click();

        await expect(page.locator('body')).toContainText('Falta tipo de cambio en detracción');
    });
});
