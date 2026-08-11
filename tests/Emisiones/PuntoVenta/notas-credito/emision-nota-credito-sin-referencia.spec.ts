import {expect, test} from '@fixtures/PuntoVenta/comprobante-nc-nd.fixture';

import {CrearNotaCreditoSinReferencia} from '@screenplay/tasks/notas-credito/CrearNotaCreditoSinReferencia';
import {ModalPostEmisionVisible} from '@screenplay/questions/notas/ModalPostEmisionVisible';
import {CLIENTES, ITEMS_PV, TIPOS_COMPROBANTE} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('NC-04 | Emisión Sin Referencia', {tag: ['@puntoventa', '@nota-credito']}, () => {

    test('SC-01: Emitir NC sin referencia con factura referenciada manualmente @NC-04.1', async ({facturador, postEmision: _p}) => {

        const resultado = await facturador.realizaYObtiene(
            CrearNotaCreditoSinReferencia({
                textoMotivo: 'Motivo de nota sin referencia por automatización',
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                tipoComprobanteReferencia: 'Factura',
                serieReferencia: 'F001',
                correlativoReferencia: '1',
            })
        );
        await facturador.pregunta(ModalPostEmisionVisible());
        expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
        await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
    });
});
