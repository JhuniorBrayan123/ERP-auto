import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { EmitirFacturaExportacion } from '@screenplay/tasks/facturacion/EmitirFacturaExportacion';
import { CLIENTES, CLIENTE_EXTRANJERIA_NC_EXPORTACION, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Facturación — Emitir Factura de Exportación', () => {

    test('Emite Factura de Exportación con cliente Extranjería', async ({ cajero }) => {
        const clienteExportacion = {
            tipoDocumento: CLIENTE_EXTRANJERIA_NC_EXPORTACION.tipoDocumento,
            documento: CLIENTE_EXTRANJERIA_NC_EXPORTACION.numeroDocumento,
            nombre: CLIENTE_EXTRANJERIA_NC_EXPORTACION.nombre,
        };

        const resultado = await cajero.realizaYObtiene(
            EmitirFacturaExportacion({
                cliente: clienteExportacion,
                productos: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
            })
        );
        expect(resultado.serie).toBe('F001');
        expect(resultado.numero).toMatch(/^F001-\d{8}$/);
    });

    test('Emite Factura de Exportación con cliente sin RUC (Carnet Extranjería)', async ({ cajero }) => {
        const clienteSinRuc = {
            tipoDocumento: CLIENTES.PERSONA_EXTRANJERIA.tipoDocumento,
            documento: CLIENTES.PERSONA_EXTRANJERIA.documento,
            nombre: CLIENTES.PERSONA_EXTRANJERIA.nombre,
        };

        const resultado = await cajero.realizaYObtiene(
            EmitirFacturaExportacion({
                cliente: clienteSinRuc,
                productos: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
            })
        );
        expect(resultado.serie).toBe('F001');
        expect(resultado.numero).toMatch(/^F001-\d{8}$/);
    });
});
