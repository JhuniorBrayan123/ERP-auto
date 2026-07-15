import { expect, test } from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import { CrearPedidoVF } from '@screenplay/tasks/pedido/CrearPedidoVF';
import { ModalPostEmision } from '@question/PuntoVenta/ModalPostEmision.question';
import { MensajeVisible } from '@question/PuntoVenta/MensajeVisible';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';
import { CompartirPorEmail } from '@interactions/PuntoVenta/CompartirPorEmail';
import { IntentarDescargarPdf } from '@task/PuntoVenta/IntentarDescargarPdf.task';
import { PostEmisionPage } from '@pages/PuntoVenta/PostEmisionPage';

test.describe.serial('FC-PD-POST-EMISION | Opciones post-registro de Pedido en Vista Facturación', {
    tag: ['@facturacion', '@pedido', '@post-emision']
}, () => {
    let numeroPedido = '';

    test('Setup: Crear Pedido base para pruebas post-emisión', async ({ vendedor }) => {
        const pedido = await vendedor.realizaYObtiene(
            CrearPedidoVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.PRODUCTO_SIMPLE],
            })
        );
        numeroPedido = pedido.numero;
        expect(numeroPedido).toBeTruthy();
        expect(await vendedor.pregunta(ModalPostEmision.estaVisible())).toBe(true);
    });

    test('SC-01: Compartir pedido por email @FC-PD.PostEmail', async ({ vendedor }) => {
        test.skip(!numeroPedido, 'No se generó el pedido base');
        await vendedor.realiza(CompartirPorEmail('srqapruebaserp2@gmail.com'));
        expect(await vendedor.pregunta(MensajeVisible('¡Mail enviado!'))).toBe(true);
    });

    test('SC-02: Descargar PDF de pedido @FC-PD.PostDescargar', async ({ vendedor, page }) => {
        test.skip(!numeroPedido, 'No se generó el pedido base');
        const downloadPromise = page.waitForEvent('download', { timeout: 60_000 });
        await vendedor.realiza(IntentarDescargarPdf());
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('.pdf');
    });

    test('SC-03: Imprimir pedido registrado @FC-PD.PostImprimir', async ({ page }) => {
        test.skip(!numeroPedido, 'No se generó el pedido base');
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
});
