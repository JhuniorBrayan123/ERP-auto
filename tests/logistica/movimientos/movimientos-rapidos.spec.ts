import {test} from '@fixtures/Logistica/movimientos-fixture';
import {
    ALMACENES,
    ITEMS_TEST,
    MOTIVOS_INGRESO,
    MOTIVOS_SALIDA,
    VARIANTES,
} from '@helpers/Logistica/movimiento-data.helper';
import {KardexVerificacionPage} from '@pages/Logistica/KardexVerificacionPage';

test.describe('Movimientos Rápidos @rapidos', {tag: ['@logistica', '@movimientos']}, () => {

    // ═══════════════════════════════════════════════════════════════
    // Scenario 43: Aumentar stock desde modal de producto
    // ═══════════════════════════════════════════════════════════════
    test('debe aumentar stock de un producto desde el modal rápido', async ({
                                                                                movimientosNav,
                                                                                movimientoRapido,
                                                                                stockVerificacion,
                                                                                kardexVerificacion,
                                                                                page,
                                                                            }) => {

        await test.step('Given: navegar a lista de ítems (Productos)', async () => {
            await movimientosNav.navegarAItemsProductos();
        });

        await test.step('When: buscar ítem y acceder a visualización', async () => {
            await movimientoRapido.buscarItemPorCodigo(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await page
                .locator('[id="lgt_items_cmp-filtro-items:filtro:filtro_section_v-input:button_search"]')
                .click();
            await page.waitForLoadState('networkidle');
        });

        await test.step('And: abrir menú y seleccionar Aumentar stock', async () => {
            await movimientoRapido.abrirMenuItemAcciones(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await movimientoRapido.clickAumentarStockDesdeVisualizacion();
        });

        await test.step('And: configurar movimiento rápido de ingreso y aumentar stock', async () => {
            //await movimientoRapido.seleccionarAlmacenRapido(ALMACENES.VENTAS);
            //await movimientoRapido.seleccionarMotivoIngresoRapido(MOTIVOS_INGRESO.ALMACEN, MOTIVOS_INGRESO.ABASTECIMIENTO);
            await movimientoRapido.llenarCantidadRapida('10');
            await movimientoRapido.clickBtnAumentarStock();
            await movimientoRapido.cerrarModalConfirmacion();
        });

        // await test.step('Then:  y aumentar stock', async () => {
        //     //await movimientoRapido.clickBtnAumentarStock();
        //     await movimientoRapido.cerrarModalConfirmacion();
        // });

        await test.step('And: verificar stock', async () => {
            //await page.locator('.v-modal > div').first().click();
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await stockVerificacion.clickVariosTexto();
        });

        await test.step('And: verificar kardex', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
            const kardexPopup = new KardexVerificacionPage(kardexPage);

            // await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.VENTAS);
            // await kardexPopup.cerrarModalDetalle();

        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 44: Aumentar stock con variante
    // ═══════════════════════════════════════════════════════════════
    test('debe aumentar stock de una variante desde el modal rápido', async ({
                                                                                 movimientosNav,
                                                                                 movimientoRapido,
                                                                                 stockVerificacion,
                                                                                 page,
                                                                             }) => {

        await test.step('Given: navegar a lista de ítems (Productos)', async () => {
            await movimientosNav.navegarAItemsProductos();
        });

        await test.step('When: buscar variante y acceder a incrementar stock', async () => {
            await movimientoRapido.buscarItemPorCodigo(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await page
                .locator('[id="lgt_items_cmp-filtro-items:filtro:filtro_section_v-input:button_search"]')
                .click();
            await page.waitForLoadState('networkidle');
        });

        await test.step('And: seleccionar variante y incrementar stock', async () => {
            // Click en la variante fila
            await movimientoRapido.clickexpandeVariante(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await movimientoRapido.abrirMenuItemAcciones(VARIANTES.V1_FLEXIBLE);
            await movimientoRapido.clickIncrementarStockVariante();
        });

        await test.step('And: configurar movimiento rápido', async () => {
            await movimientoRapido.seleccionarAlmacenRapido(ALMACENES.VENTAS);
            await movimientoRapido.seleccionarMotivoIngresoRapido(MOTIVOS_INGRESO.ALMACEN, MOTIVOS_INGRESO.COMPRAS);
            await movimientoRapido.llenarCantidadRapida('10');
        });

        await test.step('Then: aumentar stock', async () => {
            await movimientoRapido.clickBtnAumentarStock();
            await movimientoRapido.cerrarModalConfirmacion();
        });

        await test.step('And: verificar stock de la variante', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await stockVerificacion.clickVariante(VARIANTES.V1_FLEXIBLE);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 45: Disminuir stock desde modal de producto
    // ═══════════════════════════════════════════════════════════════
    test('debe disminuir stock de un producto desde el modal rápido', async ({
                                                                                 movimientosNav,
                                                                                 movimientoRapido,
                                                                                 stockVerificacion,
                                                                                 page,
                                                                                 kardexVerificacion,
                                                                             }) => {

        await test.step('Given: navegar a lista de ítems (Productos)', async () => {
            await movimientosNav.navegarAItemsProductos();
        });

        await test.step('When: buscar producto y abrir disminuir stock', async () => {
            await movimientoRapido.buscarItemPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await page
                .locator('[id="lgt_items_cmp-filtro-items:filtro:filtro_section_v-input:button_search"]')
                .click();
            await page.waitForLoadState('networkidle');
            await movimientoRapido.abrirMenuItemAcciones(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await movimientoRapido.clickDisminuirStockDesdeMenu();
        });

        await test.step('And: configurar movimiento y retirar stock', async () => {
            await movimientoRapido.seleccionarAlmacenRapido(ALMACENES.VENTAS);
            await movimientoRapido.seleccionarMotivoSalidaDesdeDiv(MOTIVOS_SALIDA.VENTA, MOTIVOS_SALIDA.ABASTECIMIENTO);
            await movimientoRapido.llenarCantidadRapida('5');
        });

        await test.step('Then: retirar stock', async () => {
            await movimientoRapido.clickBtnRetirarStock();
            await movimientoRapido.cerrarModalConfirmacion();
        });

        await test.step('And: verificar stock', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await stockVerificacion.clickVariosTexto();
        });

        await test.step('And: verificar kardex', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            // await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            // await kardexPopup.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 46: Disminuir stock con insumo
    // ═══════════════════════════════════════════════════════════════
    test('debe disminuir stock de un insumo desde el modal rápido', async ({
                                                                               movimientosNav,
                                                                               movimientoRapido,
                                                                               stockVerificacion,
                                                                               page,
                                                                           }) => {

        await test.step('Given: navegar a lista de Insumos', async () => {
            await movimientosNav.navegarAItemsProductos();
            // Cambiar a Insumos usando el tipo de ítem filter
            await movimientoRapido.abrirTabInsumos();
        });

        await test.step('When: buscar insumo y abrir disminuir stock', async () => {
            await movimientoRapido.buscarItemPorCodigo(ITEMS_TEST.INSUMO_FLEXIBLE.codigo);
            // await page
            //     .locator('[id="lgt_items_cmp-filtro-items:filtro:filtro_section_v-input:button_search"]')
            //     .click();
            await page.waitForLoadState('networkidle');
            await movimientoRapido.abrirMenuItemAcciones(ITEMS_TEST.INSUMO_FLEXIBLE.codigo);
            await movimientoRapido.clickDisminuirStockDesdeMenu();
        });

        await test.step('And: configurar movimiento y retirar stock', async () => {
            await movimientoRapido.seleccionarAlmacenRapido(ALMACENES.AUTO);
            await movimientoRapido.seleccionarMotivoSalidaDesdeDiv(MOTIVOS_SALIDA.VENTA, MOTIVOS_SALIDA.INSUMOS);
            await movimientoRapido.llenarCantidadRapida('3');
        });

        await test.step('Then: retirar stock', async () => {
            await movimientoRapido.clickBtnRetirarStock();
            await movimientoRapido.cerrarModalConfirmacion();
        });

        await test.step('And: verificar stock del insumo', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.INSUMO_FLEXIBLE.codigo);
            await stockVerificacion.clickVariosTexto();
        });
    });
});
