import {expect, test} from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import {CrearPedidoVF} from '@screenplay/tasks/pedido/CrearPedidoVF';
import {ModalPostEmision} from '@question/PuntoVenta/ModalPostEmision.question';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {CompartirPorEmail} from '@interactions/PuntoVenta/CompartirPorEmail';
import {IntentarDescargarPdf} from '@task/PuntoVenta/IntentarDescargarPdf.task';
test('FC-PD: Compartir y descargar pedido @FC-PD.PostCompleto', async ({vendedor, page}) => {
    
    const pedido = await vendedor.realizaYObtiene(
        CrearPedidoVF({
            cliente: CLIENTES.PERSONA_DNI,
            items: [ITEMS_PV.PRODUCTO_SIMPLE],
        })
    );
    expect(pedido.numero).toBeTruthy();
    expect(await vendedor.pregunta(ModalPostEmision.estaVisible())).toBe(true);

    
    await vendedor.realiza(CompartirPorEmail('srqapruebaserp2@gmail.com'));
    expect(await vendedor.pregunta(MensajeVisible('¡Mail enviado!'))).toBe(true);

    
    const downloadPromise = page.waitForEvent('download', {timeout: 60_000});
    await vendedor.realiza(IntentarDescargarPdf());
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
});
