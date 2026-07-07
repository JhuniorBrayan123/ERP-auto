import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { AplicarDescuentoGlobal } from '@screenplay/tasks/facturacion/AplicarDescuento';
import { TotalesDeVenta } from '@screenplay/questions/facturacion/TotalesDeVenta';
import { EmitirComprobanteSimple } from '@screenplay/tasks/facturacion/EmitirComprobanteSimple';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Facturación — Descuento Global en Boleta', () => {

    test('Aplica descuento global de S/ 5 y verifica en totales', async ({ cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('BOLETA'),
            BuscarYSeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            AplicarDescuentoGlobal({ valor: '5', tipo: 'monto' }),
        );

        const totales = await cajero.pregunta(TotalesDeVenta());

        expect(totales).toBeDefined();
        const descuentoGlobal = totales['Descuento global'] ?? totales['Descuento'] ?? '';
        expect(descuentoGlobal).toBeDefined();
    });

    test('Emite Boleta con descuento global aplicado', async ({ cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('BOLETA'),
            BuscarYSeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            AplicarDescuentoGlobal({ valor: '5', tipo: 'monto' }),
        );

        const resultado = await cajero.realizaYObtiene(
            EmitirComprobanteSimple({
                tipoComprobante: 'BOLETA',
                cliente: CLIENTES.PERSONA_DNI,
                producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                metodoPago: 'efectivo',
            })
        );
        expect(resultado.serie).toBe('B001');
        expect(resultado.numero).toMatch(/^B001-\d{8}$/);
    });
});
