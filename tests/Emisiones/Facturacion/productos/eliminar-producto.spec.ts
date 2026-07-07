import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { VentaGridTargets } from '@screenplay/targets/facturacion/VentaGridTargets';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Facturación — Eliminar producto de la grilla', () => {

    test('Elimina un producto de la grilla y verifica que quede vacía', async ({ page, cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('BOLETA'),
            BuscarYSeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
        );

        await VentaGridTargets.btnEliminarItem(page).click();

        const grilla = page.getByRole('table');
        const filas = await grilla.locator('tbody tr').count();
        expect(filas).toBe(0);
    });
});
