import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { EmitirDocumentoDeAdelanto } from '@screenplay/tasks/facturacion/EmitirDocumentoDeAdelanto';
import { AplicarAdelantoAVenta } from '@screenplay/tasks/facturacion/AplicarAdelantoAVenta';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Facturación — Aplicar Adelanto a Factura', () => {

    test('Aplica un adelanto de Factura a una nueva venta de Factura', async ({ cajero }) => {
        const adelanto = await cajero.realizaYObtiene(
            EmitirDocumentoDeAdelanto({
                tipoComprobante: 'FACTURA',
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                metodoPago: 'efectivo',
            })
        );

        const resultado = await cajero.realizaYObtiene(
            AplicarAdelantoAVenta({
                tipoComprobante: 'FACTURA',
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                productos: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                adelanto: {
                    serie: adelanto.serie,
                    correlativo: adelanto.correlativo,
                },
            })
        );
        expect(resultado.serie).toBe('F001');
        expect(resultado.numero).toMatch(/^F001-\d{8}$/);
    });
});
