import {expect, test} from '@fixtures/Logistica/movimientos-fixture';
import {ALMACENES, ITEMS_TEST, PATRON_CODIGO, VARIANTES,} from '@helpers/Logistica/movimiento-data.helper';
import {
    crearIngresoEstandarParaPrecondicion,
    crearSalidaEstandarParaPrecondicion,
    eliminarMovimientoDesdeListado,
    verificarEventoEnBitacora,
    verificarKardexDesdeStock,
    verificarKardexTotalEstandar,
    verificarStockPorCodigoYClick,
} from '@helpers/Logistica/verificaciones-movimientos.helper';

test.describe('MS-9 | Eliminación de Movimientos @eliminacion', {tag: ['@logistica', '@movimientos']}, () => {

    test('Eliminar movimiento correctamente @MS-9', async ({
                                                               movimientosNav,
                                                               registroMovimiento,
                                                               resultadoMovimiento,
                                                               listadoMovimientos,
                                                               stockVerificacion,
                                                               kardexVerificacion,
                                                               kardexApi,
                                                               page,
                                                           }) => {
        let saldoAfectadoAPI = 0;

        await crearSalidaEstandarParaPrecondicion(movimientosNav, registroMovimiento, resultadoMovimiento, ITEMS_TEST.PRODUCTO_GRAVADO.codigo, ITEMS_TEST.PRODUCTO_GRAVADO.nombre, '10');

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.PRODUCTO_GRAVADO.codigo);

        await verificarKardexDesdeStock(stockVerificacion, ALMACENES.AUTO, PATRON_CODIGO.SALIDA);

        await test.step('API Arrange: obtener saldo antes de eliminar', async () => {
            saldoAfectadoAPI = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_TEST.PRODUCTO_GRAVADO.codigo,
                almacenFiltro: 'AUTO',
            });
        });

        await test.step('Act: eliminar el movimiento desde el listado', async () => {
            await page.getByText('Productos y servicios').click(); // Custom UI switch
            await page.getByText('Salidas').click();
            await listadoMovimientos.abrirMenuAccionesIcono();
            await listadoMovimientos.clickEliminarMovimiento();
            await listadoMovimientos.confirmarEliminacion();
            await listadoMovimientos.cerrarModal();
        });

        await verificarEventoEnBitacora(listadoMovimientos, 'Eliminación');

        await verificarKardexTotalEstandar(movimientosNav, kardexVerificacion, page, ITEMS_TEST.PRODUCTO_GRAVADO.codigo, ALMACENES.VENTAS, PATRON_CODIGO.SALIDA);

        await test.step('API Assert: verificar que el backend sumó el saldo tras eliminación', async () => {
            const saldoPostEliminacion = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_TEST.PRODUCTO_GRAVADO.codigo,
                almacenFiltro: 'AUTO',
            });
            expect(saldoPostEliminacion).toBe(saldoAfectadoAPI + 10);
        });
    });

    test('Eliminar movimiento con variante @MS-9', async ({
                                                              movimientosNav,
                                                              registroMovimiento,
                                                              resultadoMovimiento,
                                                              listadoMovimientos,
                                                              stockVerificacion,
                                                              kardexVerificacion,
                                                              page,
                                                              kardexApi,
                                                          }) => {
        await crearSalidaEstandarParaPrecondicion(movimientosNav, registroMovimiento, resultadoMovimiento, ITEMS_TEST.VARIANTE_ESTRICTO.codigo, ITEMS_TEST.VARIANTE_ESTRICTO.nombre, '10', VARIANTES.V3_ESTRICTO.nombre);
        await test.step('And: verificar stock y kardex antes de eliminar', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_ESTRICTO.codigo);
            await kardexVerificacion.abrirKardexVariante(VARIANTES.V3_ESTRICTO.nombre);
            await page.waitForTimeout(2000)
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.VENTAS);
        });


        await test.step('Act: eliminar movimiento', async () => {
            await movimientosNav.navegarASalidas();
        });
        await eliminarMovimientoDesdeListado(listadoMovimientos);
        await verificarEventoEnBitacora(listadoMovimientos, 'Eliminación');
        await test.step('Assert: verificar kardex refleja eliminación', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_ESTRICTO.codigo);
            await kardexVerificacion.abrirKardexVariante(VARIANTES.V3_ESTRICTO.nombre);
            await page.waitForTimeout(2000)
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
        });
    });

    test('Bloquear eliminación por stock negativo @MS-9', async ({
                                                                     movimientosNav,
                                                                     registroMovimiento,
                                                                     resultadoMovimiento,
                                                                     listadoMovimientos,
                                                                     movimientoRapido,
                                                                     page,
                                                                 }) => {

        let stockActual = 0;

        await test.step('Arrange: obtener stock actual del almacén AUTO', async () => {
            await movimientosNav.navegarAItemsProductos();
            await movimientoRapido.buscarItemPorCodigo(ITEMS_TEST.SIN_STOCK.codigo);
            await movimientoRapido.abrirMenuItemAcciones(ITEMS_TEST.SIN_STOCK.codigo);
            await movimientoRapido.clickVerStockSimple();
            stockActual = await movimientoRapido.leerStockDelAlmacenEnModal(ALMACENES.AUTO);
            await movimientoRapido.cerrarModalCancelarModal();
        });
        await crearIngresoEstandarParaPrecondicion(movimientosNav, registroMovimiento, resultadoMovimiento, page, ITEMS_TEST.SIN_STOCK.codigo, ITEMS_TEST.SIN_STOCK.nombre, '10');
        await crearSalidaEstandarParaPrecondicion(movimientosNav, registroMovimiento, resultadoMovimiento, ITEMS_TEST.SIN_STOCK.codigo, ITEMS_TEST.SIN_STOCK.nombre, (stockActual + 8).toString());

        await test.step('Act: intentar eliminar el ingreso original (generaría stock negativo)', async () => {
            await listadoMovimientos.clickTabPorIndice2(1);
            await listadoMovimientos.abrirMenuAcciones()
            await listadoMovimientos.clickEliminaElMovimiento();
            await listadoMovimientos.confirmarEliminacion();
        });

        await test.step('Assert: debe mostrar alerta de stock negativo', async () => {
            await listadoMovimientos.aceptarAlertaStockNegativo();
        });
    });
});
