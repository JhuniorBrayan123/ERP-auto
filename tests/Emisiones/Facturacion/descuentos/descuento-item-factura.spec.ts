import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { EmitirComprobanteSimple } from '@screenplay/tasks/facturacion/EmitirComprobanteSimple';
import { AplicarDescuentoItem } from '@screenplay/tasks/facturacion/AplicarDescuento';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Facturación — Descuento por ítem en Factura', () => {

    test('Emite factura con descuento por ítem desde Vista Facturación', async ({ cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYSeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            AplicarDescuentoItem({ indiceItem: 0, valor: '50', tipo: 'monto' }),
        );

        const resultado = await cajero.realizaYObtiene(
            EmitirComprobanteSimple({
                tipoComprobante: 'FACTURA',
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                metodoPago: 'efectivo',
            })
        );

        expect(resultado.serie).toBe('F001');
        expect(resultado.numero).toMatch(/^F001-\d{8}$/);
    });
});
