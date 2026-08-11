import {test} from '@fixtures/Logistica/movimientos-fixture';
import {
    ALMACENES,
    ITEMS_TEST,
    MOTIVOS_INGRESO,
    MOTIVOS_SALIDA,
    VARIANTES,
} from '@helpers/Logistica/movimiento-data.helper';
import {KardexVerificacionPage} from '@pages/Logistica/KardexVerificacionPage';
import {
    buscarItemEnListadoRapidoYAcceder,
    configurarYAumentarStockRapido,
    configurarYRetirarStockRapido,
    configurarYRetirarStockRapido2,
    verificarStockPorCodigoYClick,
} from '@helpers/Logistica/verificaciones-movimientos.helper';
import {esperarCargaOverlay} from "@utils/wait-helpers";

test.describe('MS-12 | Movimientos Rápidos @rapidos', {tag: ['@logistica', '@movimientos']}, () => {

    test('SC-01: Aumentar stock desde modal de producto @MS-12.1', async ({
                                                                     movimientosNav,
                                                                     movimientoRapido,
                                                                     stockVerificacion,
                                                                     page,
                                                                 }) => {

        await test.step('Given: navegar a lista de ítems (Productos)', async () => {
            await movimientosNav.navegarAItemsProductos();
        });

        await buscarItemEnListadoRapidoYAcceder(movimientoRapido, page, ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);

        await test.step('And: abrir menú y seleccionar Aumentar stock', async () => {
            await movimientoRapido.abrirMenuItemAcciones(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await esperarCargaOverlay(page);
            await movimientoRapido.clickAumentarStockDesdeVisualizacion('ALMACÉN DE VENTAS');
        });

        await configurarYAumentarStockRapido(movimientoRapido, '', '', '', '10');

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);

        await test.step('And: verificar kardex', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            const kardexPopup = new KardexVerificacionPage(kardexPage);
        });
    });

    test('SC-02: Aumentar stock con variante @MS-12.2', async ({
                                                          movimientosNav,
                                                          movimientoRapido,
                                                          stockVerificacion,
                                                          page,
                                                      }) => {

        await test.step('Given: navegar a lista de ítems (Productos)', async () => {
            await movimientosNav.navegarAItemsProductos();
        });

        await buscarItemEnListadoRapidoYAcceder(movimientoRapido, page, ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
        await test.step('And: seleccionar variante e incrementar stock', async () => {
            await movimientoRapido.clickexpandeVariante(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await movimientoRapido.abrirMenuItemAcciones(VARIANTES.V1_FLEXIBLE.nombre);
            await movimientoRapido.clickIncrementarStockVariante();
        });

        await configurarYAumentarStockRapido(movimientoRapido, ALMACENES.VENTAS, MOTIVOS_INGRESO.ALMACEN, MOTIVOS_INGRESO.COMPRAS, '10');

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.VARIANTE_FLEXIBLE.codigo, async () => {
            await stockVerificacion.clickVariante(VARIANTES.V1_FLEXIBLE.nombre);
        });
    });

    test('SC-03: Disminuir stock desde modal de producto @MS-12.3', async ({
                                                                      movimientosNav,
                                                                      movimientoRapido,
                                                                      stockVerificacion,
                                                                      page,
                                                                  }) => {

        await test.step('Given: navegar a lista de ítems (Productos)', async () => {
            await movimientosNav.navegarAItemsProductos();
        });

        await buscarItemEnListadoRapidoYAcceder(movimientoRapido, page, ITEMS_TEST.ESTRICTO_GRAVADO_5.codigo);

        await test.step('And: abrir menú y seleccionar disminuir stock', async () => {
            await movimientoRapido.abrirMenuItemAcciones(ITEMS_TEST.ESTRICTO_GRAVADO_5.codigo);
            await movimientoRapido.clickDisminuirStockDesdeMenu();
        });

        await configurarYRetirarStockRapido(movimientoRapido, ALMACENES.VENTAS, MOTIVOS_SALIDA.VENTA, MOTIVOS_SALIDA.ABASTECIMIENTO, '5');

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.ESTRICTO_GRAVADO_5.codigo);

        await test.step('And: verificar kardex', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock(ITEMS_TEST.ESTRICTO_GRAVADO_5.codigo);
            const kardexPopup = new KardexVerificacionPage(kardexPage);
        });
    });

    test('SC-04: Disminuir stock con insumo @MS-12.4', async ({
                                                         movimientosNav,
                                                         movimientoRapido,
                                                         stockVerificacion,
                                                         page,
                                                     }) => {

        await test.step('Given: navegar a lista de Insumos', async () => {
            await movimientosNav.navegarAItemsProductos();
            await movimientoRapido.abrirTabInsumos();
        });

        await test.step('When: buscar insumo y abrir disminuir stock', async () => {
            await movimientoRapido.buscarItemPorCodigo(ITEMS_TEST.INSUMO_FLEXIBLE.codigo);
            await page.waitForLoadState('networkidle');
            await movimientoRapido.abrirMenuItemAcciones(ITEMS_TEST.INSUMO_FLEXIBLE.codigo);
            await movimientoRapido.clickDisminuirStockDesdeMenu();
        });
        await configurarYRetirarStockRapido2(movimientoRapido, ALMACENES.AUTO, MOTIVOS_SALIDA.VENTA, MOTIVOS_SALIDA.INSUMOS, '3');
        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.INSUMO_FLEXIBLE.codigo);
    });
});
