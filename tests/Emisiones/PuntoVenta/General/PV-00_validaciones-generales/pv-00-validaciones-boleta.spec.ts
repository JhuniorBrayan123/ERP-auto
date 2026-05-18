import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-00 | Validaciones generales de emisión — Boleta @PV-00', {tag: ['@punto-venta', '@boleta', '@validaciones']}, () => {

    // ─── Bloquear boleta sin cliente >= 700 (NO va a búsqueda) ────────
    test('Bloquear emisión de boleta sin cliente para montos >= 700 @PV-00.1', async ({
                                                                                         cajaPage, emisionPage, page,
                                                                                     }) => {
        await test.step('Given: la caja está abierta', async () => {
            await cajaPage.asegurarCajaAbierta();
        });

        await test.step('And: agregar producto y editar precio a 750', async () => {
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
            await emisionPage.editarPrecioItem('750.00');
        });

        await test.step('When: intentar pagar sin cliente', async () => {
            await emisionPage.clickPagar();
        });

        await test.step('Then: debe mostrar validación de monto mayor a 700', async () => {
            await expect(
                page.getByText('Selecciona un cliente para montos mayores a S/700'),
            ).toBeVisible();
        });

        await test.step('And: cerrar error', async () => {
            await emisionPage.clickAceptarError();
        });
    });

    // ─── Bloquear boleta con fecha fuera de rango (NO va a búsqueda) ──
    test('Bloquear emisión de boleta con fecha fuera del rango permitido @PV-00.2', async ({
                                                                                               cajaPage,
                                                                                               emisionPage,
                                                                                               page,
                                                                                           }) => {
        await test.step('Given: caja abierta y producto agregado', async () => {
            await cajaPage.continuarVendiendo();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
        });

        let fechaAntes = '';
        await test.step('And: capturar la fecha actual mostrada', async () => {
            fechaAntes = await emisionPage.obtenerFechaMostrada();
        });

        await test.step('When: intentar seleccionar una fecha con más de 4 días de antigüedad', async () => {
            await emisionPage.clickFechaFueraDeRango(4);
        });

        await test.step('Then: la fecha mostrada NO debe haber cambiado', async () => {
            const fechaDespues = await emisionPage.obtenerFechaMostrada();
            expect(fechaDespues).toBe(fechaAntes);
        });
    });
});
