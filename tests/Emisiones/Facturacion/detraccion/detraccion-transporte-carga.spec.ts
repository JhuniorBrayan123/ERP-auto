import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';
import { DetraccionPage } from '@pages/PuntoVenta/detraccion.page';

test.describe('Facturación — Detracción transporte de carga', () => {

    test('Emite factura con detracción de transporte de carga exitosamente', async ({ page, cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYSeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
        );

        await FacturacionTargets.sliderDetraccion(page).click({ force: true });
        await FacturacionTargets.btnEditarDetraccion(page).click();

        const detraccionPage = new DetraccionPage(page);
        await detraccionPage.page.getByText('Operación Sujeta a Detracción').first().click();
        await detraccionPage.page.getByText('Operación Sujeta a Detracción - Servicio de Transporte de Carga').click();

        await detraccionPage.page.locator('[id="pv_punto-venta_drapes:datos-detraccion_v-input:porcentaje"]').fill('4');
        await detraccionPage.page.locator('[id="pv_punto-venta_drapes:datos-detraccion_v-input:numero-cuenta"]').fill('45-241-45457');
        await detraccionPage.page.getByRole('button', { name: 'Agregar detalle de carga' }).click();
        await detraccionPage.page.getByRole('button', { name: 'Agregar tramo y vehículo' }).click();

        await detraccionPage.page.getByRole('textbox', { name: 'Ingresa distrito, ciudad o' }).first().fill('arequip');
        await detraccionPage.page.getByText('- Arequipa - Arequipa - Arequipa').click();
        await detraccionPage.page.getByRole('textbox', { name: 'Ingresa distrito, ciudad o' }).fill('lima');
        await detraccionPage.page.getByText('- Lima - Lima - Lima').click();

        await page.locator('[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:configuracion-vehicular"]').fill('estándar');
        await page.locator('[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:carga-util-metricas-vehiculo"]').fill('20');
        await page.locator('[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:description-tramo"]').fill('tramo automatizado');
        await page.locator('[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:carga-efectiva-toneladas-metricas"]').fill('2');
        await page.getByRole('textbox', { name: 'Ej. S/' }).fill('500');
        await page.locator('[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:valor-referencial-tonelada-metrica"]').fill('2');

        await detraccionPage.page.getByRole('button', { name: 'Guardar', exact: true }).click();
        await detraccionPage.page.getByRole('button', { name: 'Guardar', exact: true }).click();
        await detraccionPage.page.getByRole('button', { name: 'Actualizar' }).click();

        await page.locator('.v-modal > div').first().click();

        await cajero.realiza(
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
        );

        await page.getByRole('button', { name: 'PAGAR' }).click();
        await page.getByRole('button', { name: 'Monto exacto' }).click();
        await page.getByRole('button', { name: 'Realizar Pago' }).click();

        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible({ timeout: 15_000 });
        await expect(page.locator('body')).toContainText('Tu comprobante fue emitido correctamente');
    });
});
