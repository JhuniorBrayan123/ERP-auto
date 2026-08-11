import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { IncrementarCantidadProducto } from '@screenplay/interactions/facturacion/IncrementarCantidadProducto';
import { VentaGridTargets } from '@screenplay/targets/facturacion/VentaGridTargets';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('FC-16 | Modificar cantidad de producto', {tag: ['@facturacion', '@productos']}, () => {

    test('SC-01: Incrementar cantidad de un producto en la grilla desde Vista Facturación @FC-16.1', async ({ page, cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('BOLETA'),
            BuscarYSeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            IncrementarCantidadProducto(0, 2),
        );

        const inputCantidad = VentaGridTargets.inputCantidad(page, 0);
        const valor = await inputCantidad.inputValue();
        expect(parseInt(valor)).toBeGreaterThanOrEqual(3);
    });
});
