import { test, expect } from '@fixtures/PuntoVenta/emision-fixture';
import { Cajero } from '../../../../src/actors/cajero';
import { IniciarVentaEnCaja } from '@task/PuntoVenta/IniciarVentaEnCaja';
import { SeleccionarTipoComprobante } from '@task/PuntoVenta/SeleccionarTipoComprobante.task';
import { AgregarItemAlCarrito } from '@task/PuntoVenta/AgregarItemAlCarrito.task';
import { RegistrarPedido } from '@task/PuntoVenta/RegistrarPedido.task';
import { ModalPostEmision } from '@question/PuntoVenta/ModalPostEmision.question';
import { CompartirPorEmail } from '../../../../src/interactions/PuntoVenta/CompartirPorEmail';
import { PostEmisionPage } from '@pages/PuntoVenta/PostEmisionPage';
import { TIPOS_COMPROBANTE, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-20: Opciones post-registro de Pedido', () => {
    test.beforeEach(async ({ page }) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIMPLE),
            RegistrarPedido()
        );
        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
    });

    test('P3: Compartir pedido por email', async ({ page }) => {
        const cajero = Cajero.con(page);
        
        await cajero.intentaRealizar(
            CompartirPorEmail('test@automate.com')
        );

        await expect(page.getByText('Se envió correctamente el correo')).toBeVisible({ timeout: 5000 });
    });

    test('P4: Descargar PDF de pedido', async ({ page }) => {
        // En un caso real con el actor, se crearía una tarea "DescargarPdfComprobante"
        // Por ahora mantenemos la prueba explícita para la descarga.
        await test.step('Click en Descargar PDF', async () => {
            const postEmisionPage = new PostEmisionPage(page);
            const downloadPromise = page.waitForEvent('download');
            await postEmisionPage.clickDescargarPDF();
            const download = await downloadPromise;
            
            expect(download.suggestedFilename()).toContain('.pdf');
        });
    });
});
