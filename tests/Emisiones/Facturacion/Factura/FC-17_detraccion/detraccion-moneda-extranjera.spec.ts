import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { EmitirFacturaConDetraccion } from '@screenplay/tasks/facturacion/EmitirFacturaConDetraccion';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('FC-09 | Detracción moneda extranjera', {tag: ['@facturacion', '@detraccion']}, () => {

    test('SC-01: Emitir factura con detracción en dólares y tipo de cambio @FC-09.1', async ({ cajero }) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirFacturaConDetraccion({
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                moneda: 'dolares',
                tipoCambioExtranjera: '3.85',
                productos: [{
                    ...ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                    precioFinal: '250',
                }],
                detraccion: {
                    porcentaje: '10',
                    numeroCuenta: '11282847580',
                },
            })
        );

        expect(resultado.serie).toBe('F001');
        expect(resultado.numero).toMatch(/^F001-\d{8}$/);
    });
});
