/**
 * PV-04 | Emisión de nota de venta con descuento por ítem
 *
 * IMPORTANTE: Notas de venta NO llegan a SUNAT → no se valida estado SUNAT.
 * Post-emisión: cada test exitoso navega a Búsqueda de comprobantes + Bitácora.
 */
import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-04 | Emisión de nota de venta con descuento por ítem @PV-04', {tag: ['@punto-venta', '@nota-venta', '@descuento']}, () => {

    test('Emitir nota de venta con producto con control de stock @PV-04.1', async ({
                                                                                      cajaPage,
                                                                                      comprobantePage,
                                                                                      emisionPage,
                                                                                      kardexApi,
                                                                                      busquedaComprobantes,
                                                                                  }) => {
        let saldoAntes = 0;

        await test.step('Given: caja abierta y tipo NOTA DE VENTA', async () => {
            await cajaPage.asegurarCajaAbierta();
            await comprobantePage.seleccionarNotaVenta();
        });

        await test.step('And: capturar stock actual', async () => {
            saldoAntes = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_PV.PRODUCTO_GRAVADO.codigo,
                almacenFiltro: 'AUTO',
            });
        });

        await test.step('When: agregar producto y emitir', async () => {
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: nota de venta emitida', async () => {
            await emisionPage.clickNuevaVenta();
        });

        await test.step('And: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        await test.step('And: abrir bitácora y verificar emisión y descargo', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitidonota();
            await busquedaComprobantes.validarDescargoInventarios();
            await busquedaComprobantes.cerrarBitacora();
        });

        await test.step('And: stock disminuyó en 1', async () => {
            const saldoDespues = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_PV.PRODUCTO_GRAVADO.codigo,
                almacenFiltro: 'AUTO',
            });
            expect(saldoDespues).toBe(saldoAntes - 1);
        });
    });

    test('Emitir nota de venta con descuento global por monto @PV-04.2', async ({
                                                                                   cajaPage,
                                                                                   comprobantePage,
                                                                                   emisionPage,
                                                                                   busquedaComprobantes,
                                                                                   page,
                                                                               }) => {
        await test.step('Given: caja abierta y NOTA DE VENTA', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarNotaVenta();
        });

        await test.step('And: agregar producto', async () => {
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
        });

        await test.step('When: aplicar descuento global de S/25', async () => {
            await emisionPage.abrirDescuentoGlobal();
            await emisionPage.llenarDescuentoGlobal('25');
            await emisionPage.aplicarDescuentoGlobal();
        });

        await test.step('And: verificar descuento en totales', async () => {
            await emisionPage.abrirTotales();
            await expect(page.getByText('Total descuento global')).toBeVisible();
        });

        await test.step('And: emitir', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: nota de venta emitida', async () => {
            await emisionPage.clickNuevaVenta();
        });

        await test.step('And: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });
    });

    test('Emitir nota de venta con lista de productos @PV-04.3', async ({
                                                                           cajaPage,
                                                                           comprobantePage,
                                                                           emisionPage,
                                                                           busquedaComprobantes,
                                                                           page,
                                                                       }) => {
        await test.step('Given: caja abierta y NOTA DE VENTA', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarNotaVenta();
        });

        await test.step('When: agregar lista de ítems flexibles', async () => {
            await emisionPage.buscarItem(ITEMS_PV.LISTA_ITEMS.codigo);
            await page.getByText(ITEMS_PV.LISTA_ITEMS.nombre).click();
            await page.locator('[id="_div:increase"]').first().click();
            await page.getByRole('button', {name: 'Agregar a venta'}).click();
        });

        await test.step('And: emitir', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: nota de venta emitida', async () => {
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
    });

    test('Emitir nota de venta con equivalencia @PV-04.4', async ({
                                                                     cajaPage,
                                                                     comprobantePage,
                                                                     emisionPage,
                                                                     busquedaComprobantes,
                                                                     page,
                                                                 }) => {
        await test.step('Given: caja abierta y NOTA DE VENTA', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarNotaVenta();
        });

        await test.step('When: agregar ítem con equivalencia X6', async () => {
            await emisionPage.buscarItem(ITEMS_PV.ITEM_EQUIVALENTE.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_EQUIVALENTE.nombre);
            await page.getByText('Equivalente X2').click();
            await page.getByText('Equivalencia X6').click();
            await page.locator('.cmp-informacion-item > div').first().click();
        });

        await test.step('And: emitir', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: nota de venta emitida', async () => {
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
    });
});
