import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-00 | Validaciones generales de emisión — Factura @PV-00', {tag: ['@punto-venta', '@factura', '@validaciones']}, () => {

    // ─── Helper: seleccionar factura + cliente RUC ────────────────────
    async function setupFacturaConClienteRUC(
        comprobantePage: any, clientePage: any, page: any,
    ) {
        await comprobantePage.seleccionarFactura();
        await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
        await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
        await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
    }

    test('Bloquear factura sin cliente RUC @PV-00.3', async ({
                                                                cajaPage, comprobantePage, emisionPage, page,
                                                            }) => {
        await test.step('Given: caja abierta, FACTURA sin cliente', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
        });

        await test.step('And: agregar producto', async () => {
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
        });

        await test.step('When: intentar pagar', async () => {
            await emisionPage.clickPagar();
        });

        await test.step('Then: bloqueo por falta de RUC', async () => {
            await expect(
                page.getByText('Selecciona un cliente con RUC para emitir una factura'),
            ).toBeVisible();
            await emisionPage.clickAceptarError();
        });
    });

    // ─── Bloquear factura con fecha fuera de rango ────────────────────
    test('Bloquear emisión de factura con fecha fuera del rango permitido @PV-00.4', async ({
                                                                                                cajaPage,
                                                                                                comprobantePage,
                                                                                                emisionPage,
                                                                                                page,
                                                                                            }) => {
        await test.step('Given: caja abierta, FACTURA con cliente RUC y producto', async () => {
            await cajaPage.continuarVendiendo();
            await setupFacturaConClienteRUC(comprobantePage, null, page);
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
        });

        let fechaAntes = '';
        await test.step('And: capturar la fecha actual mostrada', async () => {
            fechaAntes = await emisionPage.obtenerFechaMostrada();
        });

        await test.step('When: intentar seleccionar una fecha con más de 3 días de antigüedad', async () => {
            await emisionPage.clickFechaFueraDeRango(3);
        });

        await test.step('Then: la fecha mostrada NO debe haber cambiado', async () => {
            const fechaDespues = await emisionPage.obtenerFechaMostrada();
            expect(fechaDespues).toBe(fechaAntes);
        });
    });
});
