import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { EmitirDocumentoDeAdelanto } from '@screenplay/tasks/facturacion/EmitirDocumentoDeAdelanto';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('FC-29 | Emitir Documento de Adelanto — Nota de Venta', {tag: ['@facturacion', '@adelantos']}, () => {

    test('SC-03: Emitir una Nota de Venta de Adelanto @FC-29.3', async ({ cajero }) => {
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
