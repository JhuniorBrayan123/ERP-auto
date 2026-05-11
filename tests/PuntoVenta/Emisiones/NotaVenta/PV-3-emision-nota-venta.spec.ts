/**
 * PV-3 | Emisión de Nota de Venta
 *
 * Escenarios refactorizados desde codegen (casos.ts líneas 2331–2600).
 * IMPORTANTE: Notas de venta NO llegan a SUNAT → no se valida estado SUNAT.
 * Post-emisión: cada test exitoso navega a Búsqueda de comprobantes + Bitácora.
 */
import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-3 | Emisión de Nota de Venta @nota-venta', {tag: ['@punto-venta', '@emisiones']}, () => {

    test('Emitir nota de venta con producto con control de stock @PV-3.1', async ({
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

    test('Emitir nota de venta con descuento global por monto @PV-3.2', async ({
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

    test('Emitir nota de venta con lista de productos @PV-3.3', async ({
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

    test('Emitir nota de venta con equivalencia @PV-3.4', async ({
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

    test('Emitir nota de venta de adelanto @PV-3.5', async ({
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
            // Activar switch adelanto
            await page.locator(
                'div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider',
            ).click();
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

    test('Emitir nota de venta aplicando adelanto existente @PV-3.6', async ({
                                                                                 cajaPage,
                                                                                 comprobantePage,
                                                                                 emisionPage,
                                                                                 busquedaComprobantes,
                                                                                 page,
                                                                             }) => {
        await test.step('Given: crear adelanto como precondición', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarNotaVenta();
            await page.locator(
                'div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider',
            ).click();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            await emisionPage.emitirConEfectivoExacto();
            await emisionPage.clickNuevaVenta();
        });

        await test.step('And: iniciar nueva nota de venta', async () => {
            await comprobantePage.seleccionarNotaVenta();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
        });

        await test.step('When: aplicar adelanto existente', async () => {
            await page.getByRole('button', {name: 'Adelantos'}).click();
            await busquedaComprobantes.filtrarAdelanto(emisionPage.ultimaEmision); //Aplicacion de soporte: Vamos desde las 3 hasta el viernes para proponer sus ideas: La idea ganadora se va a desarrollar interesante
            await page.locator(
                '.v-checkbox-default-label.flex-row-align-items-center-justify-content-center > span',
            ).first().click();
            await page.locator('.v-modal > div').first().click();
        });

        await test.step('And: verificar total anticipos visible', async () => {
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
            await busquedaComprobantes.validarAdelantosAplicadosEnPopup(popup);
        });
    });
});
