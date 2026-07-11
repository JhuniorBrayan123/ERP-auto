import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {SeleccionarTipoComprobante} from '@task/PuntoVenta/SeleccionarTipoComprobante.task';
import {AgregarItemAlCarrito} from '@task/PuntoVenta/AgregarItemAlCarrito.task';
import {RegistrarPedido} from '@task/PuntoVenta/RegistrarPedido.task';
import {ModalPostEmision} from '@question/PuntoVenta/ModalPostEmision.question';
import {CompartirPorEmail} from '@interactions/PuntoVenta/CompartirPorEmail';
import {IntentarDescargarPdf} from '@task/PuntoVenta/IntentarDescargarPdf.task';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import {ITEMS_PV, TIPOS_COMPROBANTE} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-20 | Opciones post-registro de Pedido', {tag: ['@punto-venta', '@pedido', '@post-registro']}, () => {
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

    test('SC-01: Compartir pedido por email @PV-20.1', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            CompartirPorEmail('srqapruebaserp2@gmail.com')
        );

        await expect(page.getByText('¡Mail enviado!')).toBeVisible({timeout: 5000});
    });

    test('SC-02: Descargar PDF de pedido @PV-20.2', async ({page}) => {
        const downloadPromise = page.waitForEvent('download', {timeout: 60_000});

        await Cajero.con(page).intentaRealizar(IntentarDescargarPdf());

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('.pdf');
    });

    test('SC-03: Imprimir pedido registrado @PV-20.3', async ({page}) => {
        await page.evaluate(() => {
            (window as any).__printCalled = false;
            window.print = () => {
                (window as any).__printCalled = true;
            };
        });

        const postEmisionPage = new PostEmisionPage(page);

        await postEmisionPage.clickImprimir();

    });
});
