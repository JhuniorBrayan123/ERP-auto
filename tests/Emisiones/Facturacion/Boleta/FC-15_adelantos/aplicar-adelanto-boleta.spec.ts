import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { EmitirDocumentoDeAdelanto } from '@screenplay/tasks/facturacion/EmitirDocumentoDeAdelanto';
import { AplicarAdelantoAVenta } from '@screenplay/tasks/facturacion/AplicarAdelantoAVenta';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('FC-24 | Aplicar Adelanto a Boleta', {tag: ['@facturacion', '@adelantos']}, () => {

    test('SC-01: Aplicar un adelanto de Boleta a una nueva venta de Boleta @FC-24.1', async ({ cajero }) => {
        const adelanto = await cajero.realizaYObtiene(
            EmitirDocumentoDeAdelanto({
                tipoComprobante: 'BOLETA',
                cliente: CLIENTES.PERSONA_DNI,
                producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                metodoPago: 'efectivo',
            })
        );

        const resultado = await cajero.realizaYObtiene(
            AplicarAdelantoAVenta({
                tipoComprobante: 'BOLETA',
                cliente: CLIENTES.PERSONA_DNI,
                productos: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                adelanto: {
                    serie: adelanto.serie,
                    correlativo: adelanto.correlativo,
                },
            })
        );
        expect(resultado.serie).toBe('B001');
        expect(resultado.numero).toMatch(/^B001-\d{8}$/);
    });
});
