import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { VentaGridTargets } from '@screenplay/targets/facturacion/VentaGridTargets';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('FC-23 | Vista previa', {tag: ['@facturacion', '@vista-previa']}, () => {

    test('SC-01: Visualizar la vista previa antes de emitir desde Vista Facturación @FC-23.1', async ({ page, cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('BOLETA'),
            BuscarYSeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
        );

        await VentaGridTargets.btnVistaPrevia(page).click();

        await expect(VentaGridTargets.btnCerrarVistaPrevia(page)).toBeVisible({ timeout: 5_000 });
    });
});
