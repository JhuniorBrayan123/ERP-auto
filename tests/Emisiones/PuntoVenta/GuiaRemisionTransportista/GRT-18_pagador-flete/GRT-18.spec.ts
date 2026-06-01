import {test, expect} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaTransportistaTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaTransportista.task';
import {NavegarAGuiaTransportista} from '@task/PuntoVenta/guias-remision/NavegarAGuiaTransportista.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';

test.describe('Guías de Remisión Transportista', {
 tag: ['@guias', '@puntoventa', '@transportista'] }, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaTransportista()
        );
    });

    test('P18: Emitir guía transportista con pagador de flete adicional @GRT-18', async ({ cajero, page, listadoGuiasPage }) => {
        await cajero.intentaRealizar(
            EmitirGuiaTransportistaTask({
                peso: '10',
                items: [],
                pagadorFlete: 'otros_terceros',
                pagadorFleteData: { documento: '76975258' }
            })
        );

        await listadoGuiasPage.validarGuiaEmitidaExito();

        await test.step('Validar EMITIDO en grilla de comprobantes', async () => {
            await listadoGuiasPage.cerrarModalExito();
            await page.locator('.icon').first().click();
            await page.getByText('Ventas y compras').click();
            await page.getByText('Búsqueda de comprobantes').click();
            await page.locator('[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-GUIAS"]').click();
            await page.getByRole('button', { name: 'Ver filtros avanzados' }).click();
            await page.locator('div').filter({ hasText: /^Tipo de comprobante$/ }).nth(2).click();
            await page.getByText('Guía de Remisión T.').click();
            await page.getByRole('textbox', { name: 'Correlativo' }).click();
            await page.getByRole('textbox', { name: 'Correlativo' }).fill('3');
            await expect(page.getByRole('cell', { name: 'EMITIDO' })).toBeVisible();
        });
    });
});
