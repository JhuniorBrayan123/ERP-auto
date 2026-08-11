import { expect, test } from '@fixtures/Logistica/movimientos-fixture';
import { ALMACENES, ITEMS_TEST, PATRON_CODIGO, VARIANTES, } from '@helpers/Logistica/movimiento-data.helper';
import {
    crearIngresoEstandarParaPrecondicion2,
    crearSalidaEstandarParaPrecondicion,
    eliminarMovimientoDesdeListado,
    verificarEventoEnBitacora,
    verificarKardexDesdeStock,
    verificarKardexTotalEstandar,
    verificarStockPorCodigoYClick,
} from '@helpers/Logistica/verificaciones-movimientos.helper';
import { esperarCargaOverlay } from '@utils/wait-helpers';

test.describe('MS-09 | Eliminación de Movimientos', { tag: ['@logistica', '@movimientos'] }, () => {

    test('SC-01: Eliminar movimiento correctamente @MS-09.1', async ({
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

        await crearSalidaEstandarParaPrecondicion(movimientosNav, registroMovimiento, resultadoMovimiento, ITEMS_TEST.ESTRICTO_GRAVADO_10.codigo, ITEMS_TEST.ESTRICTO_GRAVADO_10.nombre, '10');

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.ESTRICTO_GRAVADO_10.codigo);

        await verificarKardexDesdeStock(stockVerificacion, ALMACENES.AUTO, PATRON_CODIGO.SALIDA);

        await test.step('API Arrange: obtener saldo antes de eliminar', async () => {
            saldoAfectadoAPI = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_TEST.ESTRICTO_GRAVADO_10.codigo,
                almacenFiltro: 'AUTO',
            });
        });

        await test.step('Act: eliminar el movimiento desde el listado', async () => {
            await page.getByText('Productos y servicios').click(); 
            await page.getByText('Salidas').click();
            await listadoMovimientos.abrirMenuAccionesIcono();
            await listadoMovimientos.clickEliminarMovimiento();
            await listadoMovimientos.confirmarEliminacion();
            await listadoMovimientos.cerrarModal();
        });

        await verificarEventoEnBitacora(listadoMovimientos, 'Eliminación');

        await verificarKardexTotalEstandar(movimientosNav, kardexVerificacion, page, ITEMS_TEST.ESTRICTO_GRAVADO_10.codigo, ALMACENES.AUTO, PATRON_CODIGO.SALIDA);

        await test.step('API Assert: verificar que el backend sumó el saldo tras eliminación', async () => {
            const saldoPostEliminacion = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_TEST.ESTRICTO_GRAVADO_10.codigo,
                almacenFiltro: 'AUTO',
            });
            expect(saldoPostEliminacion).toBe(saldoAfectadoAPI + 10);
        });
    });

    test('SC-02: Eliminar movimiento con variante @MS-09.2', async ({
        movimientosNav,
        registroMovimiento,
        resultadoMovimiento,
        listadoMovimientos,
        stockVerificacion,
        kardexVerificacion,
        page,
        kardexApi,
    }) => {
        await crearSalidaEstandarParaPrecondicion(movimientosNav, registroMovimiento, resultadoMovimiento, ITEMS_TEST.VARIANTE_ESTRICTO.codigo, ITEMS_TEST.VARIANTE_ESTRICTO.nombre, '10', VARIANTES.V1_ESTRICTO.nombre);
        await test.step('And: verificar stock y kardex antes de eliminar', async () => {
            await movimientosNav.navegarAKardexTotal();
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_ESTRICTO.codigo);
            await kardexVerificacion.abrirKardexVariante(VARIANTES.V1_ESTRICTO.nombre);
            await esperarCargaOverlay(page);
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.VENTAS);
        });

        await test.step('Act: eliminar movimiento', async () => {
            await movimientosNav.navegarASalidas();
        });
        await eliminarMovimientoDesdeListado(listadoMovimientos);
        await verificarEventoEnBitacora(listadoMovimientos, 'Eliminación');
        await test.step('Assert: verificar kardex refleja eliminación', async () => {
            await movimientosNav.navegarAKardexTotal();
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_ESTRICTO.codigo);
            await kardexVerificacion.abrirKardexVariante(VARIANTES.V1_ESTRICTO.nombre);
            await esperarCargaOverlay(page);
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
        });
    });

    test('SC-03: Bloquear eliminación por stock negativo @MS-09.3', async ({
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
        const ingresoCreado = await crearIngresoEstandarParaPrecondicion2(movimientosNav, registroMovimiento, resultadoMovimiento, page, ITEMS_TEST.SIN_STOCK.codigo, ITEMS_TEST.SIN_STOCK.nombre, '10');
        await crearSalidaEstandarParaPrecondicion(movimientosNav, registroMovimiento, resultadoMovimiento, ITEMS_TEST.SIN_STOCK.codigo, ITEMS_TEST.SIN_STOCK.nombre, (stockActual + 8).toString());

        await test.step('Act: intentar eliminar el ingreso original (generaría stock negativo)', async () => {
            await listadoMovimientos.clickTabPorIndice2(1);
            await listadoMovimientos.buscarMovimientoPorCodigo(ingresoCreado.codigo)
            await listadoMovimientos.abrirMenuAccionesPorCodigo(ingresoCreado.codigo)
            await listadoMovimientos.clickEliminaElMovimiento();
            await listadoMovimientos.confirmarEliminacion();
        });

        await test.step('Assert: debe mostrar alerta de stock negativo', async () => {
            await listadoMovimientos.aceptarAlertaStockNegativo();
        });
    });
});
