import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { EmitirFacturaConRetencion } from '@screenplay/tasks/facturacion/EmitirFacturaConRetencion';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('FC-18 | Emitir Factura con Retención', {tag: ['@facturacion', '@retencion']}, () => {

    test('SC-01: Emitir Factura con Retención al 3% @FC-18.1', async ({ cajero }) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirFacturaConRetencion({
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                productos: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                porcentajeRetencion: '3',
            })
        );
        expect(resultado.serie).toBe('F001');
        expect(resultado.numero).toMatch(/^F001-\d{8}$/);
    });
});
