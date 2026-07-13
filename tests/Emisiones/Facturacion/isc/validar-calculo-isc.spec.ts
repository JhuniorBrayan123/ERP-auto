import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { IncrementarCantidadProducto } from '@screenplay/interactions/facturacion/IncrementarCantidadProducto';
import { TotalesDeVenta } from '@screenplay/questions/facturacion/TotalesDeVenta';
import { EmitirComprobanteSimple } from '@screenplay/tasks/facturacion/EmitirComprobanteSimple';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('FC-13 | Cálculo de ISC', {tag: ['@facturacion', '@isc']}, () => {

    test('SC-01: Mostrar columna ISC y valor calculado en la grilla para producto con ISC @FC-13.1', async ({ cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('BOLETA'),
            BuscarYSeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_ISC),
        );

        const totales = await cajero.pregunta(TotalesDeVenta());

        const iscValor = totales['ISC'] ?? totales['Isc'] ?? '';
        expect(parseFloat(iscValor.replace(',', '.'))).toBeGreaterThan(0);

        const subtotal = totales['Operaciones Gravadas'] ?? '';
        expect(parseFloat(subtotal.replace(',', '.'))).toBeGreaterThan(0);
    });

    test('SC-02: Reflejar ISC proporcional al aumentar cantidad del producto @FC-13.2', async ({ cajero }) => {
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

    test('SC-03: Emitir Boleta con producto ISC correctamente @FC-13.3', async ({ cajero }) => {
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
