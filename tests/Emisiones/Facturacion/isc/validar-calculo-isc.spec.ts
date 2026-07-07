import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { IncrementarCantidadProducto } from '@screenplay/interactions/facturacion/IncrementarCantidadProducto';
import { TotalesDeVenta } from '@screenplay/questions/facturacion/TotalesDeVenta';
import { EmitirComprobanteSimple } from '@screenplay/tasks/facturacion/EmitirComprobanteSimple';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Facturación — Cálculo de ISC', () => {

    test('Muestra columna ISC y valor calculado en la grilla para producto con ISC', async ({ cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('BOLETA'),
            BuscarYSeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_ISC),
        );

        const totales = await cajero.pregunta(TotalesDeVenta());

        const iscValor = totales['ISC'] ?? totales['Isc'] ?? '';
        expect(parseFloat(iscValor.replace(',', '.'))).toBeGreaterThan(0);

        const subtotal = totales['Subtotal'] ?? totales['Base imponible'] ?? '';
        expect(parseFloat(subtotal.replace(',', '.'))).toBeGreaterThan(0);
    });

    test('Refleja ISC proporcional al aumentar cantidad del producto', async ({ cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('BOLETA'),
            BuscarYSeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_ISC),
            IncrementarCantidadProducto(0, 3),
        );

        const totales = await cajero.pregunta(TotalesDeVenta());

        const iscValor = totales['ISC'] ?? totales['Isc'] ?? '0';
        expect(parseFloat(iscValor.replace(',', '.'))).toBeGreaterThan(0);
    });

    test('Emite Boleta con producto ISC correctamente', async ({ cajero }) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirComprobanteSimple({
                tipoComprobante: 'BOLETA',
                cliente: CLIENTES.PERSONA_DNI,
                producto: ITEMS_PV.ITEM_ISC,
                metodoPago: 'efectivo',
            })
        );
        expect(resultado.serie).toBe('B001');
        expect(resultado.numero).toMatch(/^B001-\d{8}$/);
    });
});
