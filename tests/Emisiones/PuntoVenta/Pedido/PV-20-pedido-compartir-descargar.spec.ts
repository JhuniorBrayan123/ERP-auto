import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {SeleccionarTipoComprobante} from '@task/PuntoVenta/SeleccionarTipoComprobante.task';
import {AgregarItemAlCarrito} from '@task/PuntoVenta/AgregarItemAlCarrito.task';
import {RegistrarPedido} from '@task/PuntoVenta/RegistrarPedido.task';
import {ModalPostEmision} from '@question/PuntoVenta/ModalPostEmision.question';
import {CompartirPorEmail} from '../../../../src/interactions/PuntoVenta/CompartirPorEmail';
import {IntentarDescargarPdf} from '@task/PuntoVenta/IntentarDescargarPdf.task';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import {ITEMS_PV, TIPOS_COMPROBANTE} from '@helpers/PuntoVenta/emision-data.helper';


test.describe('PV-20: Opciones post-registro de Pedido', () => {
    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIMPLE),
            RegistrarPedido()
        );
        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
    });

    test('P3: Compartir pedido por email', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            CompartirPorEmail('srqapruebaserp2@gmail.com')
        );

        await expect(page.getByText('¡Mail enviado!')).toBeVisible({timeout: 5000});
    });

    test('P4: Descargar PDF de pedido', async ({page}) => {
        const downloadPromise = page.waitForEvent('download', {timeout: 60_000});

        await Cajero.con(page).intentaRealizar(IntentarDescargarPdf());

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('.pdf');
    });

    test('P19: Imprimir pedido registrado', async ({page}) => {
        // En headless, window.print() es no-op — lo mockeamos para hacerlo observable
        await page.addInitScript(() => {
            (window as any).__printCalled = false;
            window.print = () => {
                (window as any).__printCalled = true;
            };
        });
        await test.step('Click en Imprimir y validar llamada', async () => {
            const postEmisionPage = new PostEmisionPage(page);
            await postEmisionPage.clickImprimir();

            const printWasCalled = await page.evaluate(() => (window as any).__printCalled);
            expect(printWasCalled).toBe(true);
        });
    });
});
