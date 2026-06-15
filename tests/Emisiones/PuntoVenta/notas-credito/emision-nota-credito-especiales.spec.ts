import {expect, test} from '@fixtures/PuntoVenta/comprobante-nc-nd.fixture';
import {EmitirComprobanteOrigen} from '@screenplay/tasks/common/EmitirComprobanteOrigen';
import {CrearNotaCreditoConVinculacion} from '@screenplay/tasks/notas-credito/CrearNotaCreditoConVinculacion';
import {ModalPostEmisionVisible} from '@screenplay/questions/notas/ModalPostEmisionVisible';
import {CLIENTES, ITEMS_PV, TIPOS_COMPROBANTE, TIPOS_DOCUMENTO_ORIGEN} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Notas de Crédito — Motivos Especiales @pv @nota-credito', () => {

    test('Emitir NC por anulación SIN retorno de stock desde factura @emision', async ({facturador}) => {

        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
            })
        );

        const resultado = await facturador.realizaYObtiene(
            CrearNotaCreditoConVinculacion({
                vinculacion: {
                    tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.FACTURA,
                    serie: origen.serie,
                    correlativo: origen.correlativo,
                },
                motivo: 'Anulación de la operación',
                textoMotivo: 'Anulación sin retorno de stock por automatización',
                retornoStock: false,
            })
        );
        await facturador.pregunta(ModalPostEmisionVisible());
        expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
        await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
    });

    test('Emitir NC por anulación por error en el RUC desde factura @emision', async ({facturador}) => {
        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
            })
        );

        const resultado = await facturador.realizaYObtiene(
            CrearNotaCreditoConVinculacion({
                vinculacion: {
                    tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.FACTURA,
                    serie: origen.serie,
                    correlativo: origen.correlativo,
                },
                motivo: 'Anulación por error en el RUC',
                textoMotivo: 'Anulación por error en el RUC por automatización',
            })
        );

        await facturador.pregunta(ModalPostEmisionVisible());
        expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
        await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
    });
});
