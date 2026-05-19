import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-04 | Vista previa de comprobante @PV-04', {tag: ['@punto-venta', '@boleta']}, () => {

    // ─── Vista previa (NO va a búsqueda) ──────────────────────────────
    test('Visualizar vista previa de una boleta antes de emitir @PV-04.5', async ({
                                                                                      cajaPage,
                                                                                      comprobantePage,
                                                                                      emisionPage,
                                                                                      page,
                                                                                  }) => {
        await test.step('Given: caja abierta, tipo BOLETA y producto agregado', async () => {
            await cajaPage.continuarVendiendo();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            await comprobantePage.seleccionarBoleta();
        });

        await test.step('When: abrir vista previa', async () => {
            await page.getByRole('button', {name: 'VISTA PREVIA'}).click();
        });

        await test.step('Then: vista previa visible', async () => {
            // La vista previa abre un overlay con el comprobante
            await page.locator('.icon-close').click();
        });
    });
});
