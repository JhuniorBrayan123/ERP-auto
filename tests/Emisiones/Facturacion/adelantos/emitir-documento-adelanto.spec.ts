import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { EmitirDocumentoDeAdelanto } from '@screenplay/tasks/facturacion/EmitirDocumentoDeAdelanto';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Facturación — Emitir Documento de Adelanto', () => {

    test('Emite una Boleta de Adelanto con cliente DNI', async ({ cajero }) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirDocumentoDeAdelanto({
                tipoComprobante: 'BOLETA',
                cliente: CLIENTES.PERSONA_DNI,
                producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                metodoPago: 'efectivo',
            })
        );
        expect(resultado.serie).toBe('B001');
        expect(resultado.numero).toMatch(/^B001-\d{8}$/);
    });

    test('Emite una Factura de Adelanto con empresa RUC', async ({ cajero }) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirDocumentoDeAdelanto({
                tipoComprobante: 'FACTURA',
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                metodoPago: 'efectivo',
            })
        );

        expect(resultado.serie).toBe('F001');
        expect(resultado.numero).toMatch(/^F001-\d{8}$/);
    });

    test('Emite una Nota de Venta de Adelanto', async ({ cajero }) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirDocumentoDeAdelanto({
                tipoComprobante: 'NOTA DE VENTA',
                cliente: CLIENTES.PERSONA_DNI,
                producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                metodoPago: 'efectivo',
            })
        );

        expect(resultado.serie).toBe('NV01');
        expect(resultado.numero).toMatch(/^NV01-\d{8}$/);
    });
});

