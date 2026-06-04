import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {esperarCargaOverlay} from "@utils/wait-helpers";

test.describe('PV-15 | Emitir comprobante con adelanto @PV-15', {tag: ['@punto-venta', '@nota-venta', '@adelanto']}, () => {

    test('Emitir nota de venta de adelanto @PV-15.4', async ({
                                                                 cajaPage,
                                                                 comprobantePage,
                                                                 emisionPage,
                                                                 kardexApi,
                                                                 busquedaComprobantes,
                                                                 page,
                                                             }) => {
        let saldoAntes = 0;

        await test.step('Given: caja abierta y NOTA DE VENTA', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarNotaVenta();
        });

        await test.step('And: capturar stock antes', async () => {
            saldoAntes = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_PV.PRODUCTO_SIMPLE.codigo,
                almacenFiltro: 'AUTO',
            });
        });

        await test.step('When: activar adelanto y agregar producto', async () => {
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_SIMPLE.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_SIMPLE.nombre);
            await emisionPage.activarDocAdelanto();
            await emisionPage.editarPrecioItem('150');
        });

        await test.step('And: emitir con YAPE', async () => {
            await emisionPage.emitirConYape();
        });

        await test.step('Then: nota de venta adelanto emitida', async () => {
            await emisionPage.clickNuevaVenta();
        });

        await test.step('And: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        await test.step('And: abrir bitácora y verificar emisión (sin descargo)', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitidonota();
            await busquedaComprobantes.validarSinDescargoInventarios();
            await busquedaComprobantes.cerrarBitacora();
        });

        await test.step('And: stock NO debe haber cambiado (adelanto no mueve stock)', async () => {
            const saldoDespues = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_PV.PRODUCTO_SIMPLE.codigo,
                almacenFiltro: 'AUTO',
            });
            expect(saldoDespues).toBe(saldoAntes);
        });
    });

    test('Emitir nota de venta aplicando adelanto existente @PV-15.5', async ({
                                                                                  cajaPage,
                                                                                  comprobantePage,
                                                                                  emisionPage,
                                                                                  busquedaComprobantes,
                                                                                  page,
                                                                              }) => {
        await test.step('Given: crear adelanto como precondición', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarNotaVenta();
            await esperarCargaOverlay(page)
            await emisionPage.activarDocAdelanto();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            await emisionPage.emitirConEfectivoExacto();
            await emisionPage.clickNuevaVenta();
        });

        await test.step('And: iniciar nueva nota de venta', async () => {
            await comprobantePage.seleccionarNotaVenta();
            await esperarCargaOverlay(page);
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
            await emisionPage.incrementarCantidad(1)
        });

        await test.step('When: aplicar adelanto existente', async () => {
            await page.getByRole('button', {name: 'Adelantos'}).click();
            await busquedaComprobantes.filtrarAdelanto(emisionPage.ultimaEmision);
            await page.locator(
                '.v-checkbox-default-label.flex-row-align-items-center-justify-content-center > span',
            ).first().click();
            await page.locator('.v-modal > div').first().click();
        });

        await test.step('And: verificar total anticipos visible', async () => {
            await emisionPage.desplegarPanelCalculos()
            await expect(page.getByText('Total anticipos')).toBeVisible();
        });

        await test.step('And: emitir', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: nota de venta con adelanto aplicado emitida', async () => {
            await emisionPage.clickNuevaVenta();
        });

        await test.step('And: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        await test.step('And: abrir bitácora y verificar emisión', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitidonota();
            await busquedaComprobantes.cerrarBitacora();
        });

        await test.step('And: Ver comprobante muestra adelantos aplicados', async () => {
            const popup = await busquedaComprobantes.abrirVerComprobante();
            await esperarCargaOverlay(popup)
            await busquedaComprobantes.validarAdelantosAplicadosEnPopup(popup);
        });
    });
});
