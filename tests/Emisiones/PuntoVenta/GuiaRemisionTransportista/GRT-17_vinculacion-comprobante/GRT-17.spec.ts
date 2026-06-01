import {test, expect} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaTransportistaTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaTransportista.task';
import {NavegarAGuiaTransportista} from '@task/PuntoVenta/guias-remision/NavegarAGuiaTransportista.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';

test.describe('Guías de Remisión Transportista', {
tag: ['@guias', '@puntoventa', '@transportista']}, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaTransportista()
        );
    });

    test('P17: Emitir guía transportista vinculando comprobante @GRT-17', async ({cajero, page, listadoGuiasPage}) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10',
                items: [],
                vincularComprobante: {
                    tipo: 'BOLETA_DE_VENTA',
                    serie: 'B001',
                    correlativo: '150',
                    rucProveedor: '20759685854'
                }
            })
        );

        await listadoGuiasPage.validarGuiaEmitidaExito();
        await expect(page.locator('body')).toContainText(/V001-/);

        await test.step('Validar que la guía aparece como EMITIDO en el listado de comprobantes', async () => {
            await listadoGuiasPage.cerrarModalExito();
            await page.locator('.icon').first().click();
            await page.getByText('Ventas y compras').click();
            await page.getByText('Búsqueda de comprobantes').click();
            await page.locator('[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-GUIAS"]').click();
            await page.getByRole('button', { name: 'Ver filtros avanzados' }).click();
            await page.locator('div').filter({ hasText: /^Tipo de comprobante$/ }).nth(2).click();
            await page.getByText('Guía de Remisión T.').click();
            await expect(page.locator('tbody')).toContainText('EMITIDO');
        });
    });
});
