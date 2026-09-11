import {expect, test} from '@fixtures/PuntoVenta/comprobante-nc-nd.fixture';
import {ObtenerComprobanteRecurrente} from '@screenplay/tasks/common/ObtenerComprobanteRecurrente';
import {CrearNotaCreditoConVinculacion} from '@screenplay/tasks/notas-credito/CrearNotaCreditoConVinculacion';
import {ModalPostEmisionVisible} from '@screenplay/questions/notas/ModalPostEmisionVisible';
import {TIPOS_DOCUMENTO_ORIGEN} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('NC-01 | Motivos Especiales', {tag: ['@puntoventa', '@nota-credito']}, () => {

    test('SC-01: Emitir NC por anulación SIN retorno de stock desde factura @NC-01.1', async ({facturador, registrarNota}) => {

        const origen = await facturador.realizaYObtiene(
            ObtenerComprobanteRecurrente('FACTURA')
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
        registrarNota(resultado.numero, resultado.correlativo);
        await facturador.pregunta(ModalPostEmisionVisible());
        expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
        await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
    });

    test('SC-02: Emitir NC por anulación por error en el RUC desde factura @NC-01.2', async ({facturador, registrarNota}) => {
        const origen = await facturador.realizaYObtiene(
            ObtenerComprobanteRecurrente('FACTURA')
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
        registrarNota(resultado.numero, resultado.correlativo);

        await facturador.pregunta(ModalPostEmisionVisible());
        expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
        await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
    });
});
