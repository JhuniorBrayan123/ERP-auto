import { expect, test } from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import { CrearPedidoVF } from '@screenplay/tasks/pedido/CrearPedidoVF';
import { ModalPostEmision } from '@question/PuntoVenta/ModalPostEmision.question';
import { MensajeVisible } from '@question/PuntoVenta/MensajeVisible';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';
import { CompartirPorEmail } from '@interactions/PuntoVenta/CompartirPorEmail';
import { IntentarDescargarPdf } from '@task/PuntoVenta/IntentarDescargarPdf.task';
import { PostEmisionPage } from '@pages/PuntoVenta/PostEmisionPage';

test('FC-PD: Compartir, descargar e imprimir pedido @FC-PD.PostCompleto', async ({ vendedor, page }) => {
    // 1. Crear Pedido — esto abre el modal post-emisión
    const pedido = await vendedor.realizaYObtiene(
        CrearPedidoVF({
            cliente: CLIENTES.PERSONA_DNI,
            items: [ITEMS_PV.PRODUCTO_SIMPLE],
        })
    );
    expect(pedido.numero).toBeTruthy();
    expect(await vendedor.pregunta(ModalPostEmision.estaVisible())).toBe(true);

    // 2. Compartir por email @FC-PD.PostEmail
    await vendedor.realiza(CompartirPorEmail('srqapruebaserp2@gmail.com'));
    expect(await vendedor.pregunta(MensajeVisible('¡Mail enviado!'))).toBe(true);

    // 3. Descargar PDF @FC-PD.PostDescargar
    const downloadPromise = page.waitForEvent('download', { timeout: 60_000 });
    await vendedor.realiza(IntentarDescargarPdf());
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');

    // 4. Imprimir @FC-PD.PostImprimir
    await page.evaluate(() => {
        (window as any).__printCalled = false;
        window.print = () => {
            (window as any).__printCalled = true;
        };
    });
    const postEmisionPage = new PostEmisionPage(page);
    await postEmisionPage.clickImprimir();
    expect(await page.evaluate(() => (window as any).__printCalled)).toBe(true);
});
