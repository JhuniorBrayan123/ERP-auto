import {expect, test} from '@fixtures/Logistica/movimientos-fixture';
import {ALMACENES, ITEMS_TEST, PATRON_CODIGO, VARIANTES,} from '@helpers/Logistica/movimiento-data.helper';
import {KardexVerificacionPage} from '@pages/Logistica/KardexVerificacionPage';

test.describe('MS-9 | Eliminación de Movimientos @eliminacion', {tag: ['@logistica', '@movimientos']}, () => {

    // ═══════════════════════════════════════════════════════════════
    // Scenario 31: Eliminar movimiento correctamente
    // ═══════════════════════════════════════════════════════════════
    test('debe eliminar una salida y reflejar en stock, bitácora y kardex @MS-9', async ({
                                                                                             movimientosNav,
                                                                                             registroMovimiento,
                                                                                             resultadoMovimiento,
                                                                                             listadoMovimientos,
                                                                                             stockVerificacion,
                                                                                             kardexVerificacion,
                                                                                             page,
                                                                                         }) => {


        await test.step('Arrange: crear salida para eliminar', async () => {
            await movimientosNav.navegarASalidas();
            await registroMovimiento.clickAgregarSalida();
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_GRAVADO.nombre);
            await registroMovimiento.llenarCantidad('10');
            await registroMovimiento.clickTextoRegistrarSalida();
            await registroMovimiento.clickRegistrarYDespachar();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('And: verificar stock antes de eliminar', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await stockVerificacion.clickVariosTexto();
        });

        await test.step('And: verificar kardex antes de eliminar', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await expect(kardexPage.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
            await kardexPopup.cerrarModalDetalle();

            // // Navegar al kardex total desde el popup
            // await kardexPopup.navegarAKardexTotalDesdePopup1();
            // await kardexPopup.buscarPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            // await kardexPopup.clickVariosTexto();
            // await kardexPopup.clickKardexPorProducto();
            // await kardexPopup.abrirVerDetalle(1);
            // await expect(kardexPage.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
            // await kardexPopup.cerrarModalDetalle();
        });

        await test.step('Act: eliminar el movimiento desde el listado', async () => {
            // Volver al popup y eliminar
            await page.getByText('Productos y servicios').click();
            await page.getByText('Salidas').click();
            await listadoMovimientos.abrirMenuAccionesIcono();
            await listadoMovimientos.clickEliminarMovimiento();
            await listadoMovimientos.confirmarEliminacion();
            await listadoMovimientos.cerrarModal();
        });

        await test.step('Assert: verificar bitácora de eliminación', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerBitacora();
            await listadoMovimientos.clickEventoBitacora('Eliminación');
            await listadoMovimientos.cerrarBitacora();
        });

        await test.step('Assert: verificar kardex refleja eliminación', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000)
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await kardexVerificacion.clickVariosTexto();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 32: Eliminar movimiento con variante
    // ═══════════════════════════════════════════════════════════════
    test('debe eliminar salida con variante y reflejar en stock y kardex @MS-9', async ({
                                                                                            movimientosNav,
                                                                                            registroMovimiento,
                                                                                            resultadoMovimiento,
                                                                                            listadoMovimientos,
                                                                                            stockVerificacion,
                                                                                            kardexVerificacion,
                                                                                            page,
                                                                                        }) => {


        await test.step('Arrange: crear salida con variante estricta', async () => {
            await movimientosNav.navegarASalidas();
            await registroMovimiento.clickAgregarSalida();
            await registroMovimiento.buscarItem(ITEMS_TEST.VARIANTE_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.VARIANTE_ESTRICTO.nombre);
            await registroMovimiento.seleccionarVariante(VARIANTES.V3_ESTRICTO);
            await registroMovimiento.clickTextoRegistrarSalida();
            await registroMovimiento.clickRegistrarYDespachar();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('And: verificar stock y kardex antes de eliminar', async () => {
            // await movimientosNav.navegarAStockProductos();
            // await stockVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_ESTRICTO.codigo);
            // //await kardexVerificacion.abrirVerDetalle(1); General para otros se usara este y se creara otro para variantes
            // //await movimientosNav.navegarAStockProductos();
            // await kardexVerificacion.abrirKardexVariante(VARIANTES.V3_ESTRICTO);
            // // await stockVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_ESTRICTO.codigo);
            // // await stockVerificacion.clickVariante(VARIANTES.V3_ESTRICTO);
            // await stockVerificacion.clickAlmacenMultipleNth(0);

            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_ESTRICTO.codigo);

            // Click en "Kardex por producto" de la fila de la variante 3
            await kardexVerificacion.abrirKardexVariante(VARIANTES.V3_ESTRICTO);
            await page.waitForTimeout(2000)
            // Ahora estamos en la misma página en la vista de Kardex por producto
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);// o el índice que corresponda

            // Verificar y hacer click en el código de salida
            await expect(page.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
            await kardexVerificacion.esperarSinOverload();
            await page.getByText(PATRON_CODIGO.SALIDA).first().click();
            await kardexVerificacion.esperarSinOverload();
            await kardexVerificacion.cerrarModalDetalle();
        });

        await test.step('Act: eliminar movimiento', async () => {
            await movimientosNav.navegarASalidas();
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickEliminarMovimiento();
            await listadoMovimientos.confirmarEliminacion();
            await listadoMovimientos.cerrarModal();
        });

        await test.step('Assert: verificar bitácora de eliminación', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerBitacora();
            await listadoMovimientos.clickEventoBitacora('Eliminación');
            await listadoMovimientos.cerrarBitacora();
        });

        await test.step('Assert: verificar kardex refleja eliminación', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_ESTRICTO.codigo);

            // Click en "Kardex por producto" de la fila de la variante 3
            await kardexVerificacion.abrirKardexVariante(VARIANTES.V3_ESTRICTO);
            await page.waitForTimeout(2000)

            // Ahora estamos en la misma página en la vista de Kardex por producto
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO); // o el índice que corresponda

            // Verificar y hacer click en el código de salida
            await expect(page.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
            await kardexVerificacion.esperarSinOverload();
            // await page.getByText(PATRON_CODIGO.SALIDA).first().click();
            // await kardexVerificacion.esperarSinOverload();
            // await kardexVerificacion.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 33: Bloquear eliminación por stock negativo
    // ═══════════════════════════════════════════════════════════════
    test('debe bloquear eliminación cuando genera stock negativo @MS-9', async ({
                                                                                    movimientosNav,
                                                                                    registroMovimiento,
                                                                                    resultadoMovimiento,
                                                                                    listadoMovimientos,
                                                                                    movimientoRapido,
                                                                                    kardexVerificacion
                                                                                }) => {
        test.setTimeout(180_000)
        // Se declara fuera de los steps para que sea accesible entre ellos (Arrange → And)
        let stockActual = 0;

        await test.step('Arrange: obtener stock actual del almacén AUTO', async () => {
            // Navegar a la lista de ítems y buscar el ítem objetivo
            await movimientosNav.navegarAItemsProductos();

            await movimientoRapido.buscarItemPorCodigo(ITEMS_TEST.SIN_STOCK.codigo);

            // Abrir modal de visualización de stock
            await movimientoRapido.abrirMenuItemAcciones(ITEMS_TEST.SIN_STOCK.codigo);
            await movimientoRapido.clickVerStockSimple();

            // Leer el stock actual del almacén AUTO desde el modal
            stockActual = await movimientoRapido.leerStockDelAlmacenEnModal(ALMACENES.AUTO);

            // Cerrar el modal antes de continuar con el flujo de movimientos
            await movimientoRapido.cerrarModalCancelarModal();
        });

        await test.step('Arrange: crear ingreso con ítem sin stock previo', async () => {
            await movimientosNav.navegarAIngresos();
            await registroMovimiento.clickAgregarIngreso();
            await registroMovimiento.buscarItem(ITEMS_TEST.SIN_STOCK.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.SIN_STOCK.nombre);
            await registroMovimiento.llenarCantidad('10');
            await registroMovimiento.clickRegistrarIngreso();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('And: crear salida dinámica (stockActual + 8) para garantizar bloqueo de eliminación', async () => {
            // Fórmula: salida = S + 8
            // Después del ingreso: S + 10
            // Después de la salida: (S + 10) - (S + 8) = 2  → residuo siempre = 2
            // Al intentar eliminar el ingreso de 10: 2 - 10 = -8  → sistema bloquea siempre
            const cantidadSalida = stockActual + 8;

            await movimientosNav.navegarASalidas();
            await registroMovimiento.clickAgregarSalida();
            await registroMovimiento.buscarItem(ITEMS_TEST.SIN_STOCK.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.SIN_STOCK.nombre);
            await registroMovimiento.llenarCantidad(cantidadSalida.toString());
            await registroMovimiento.clickTextoRegistrarSalida();
            await registroMovimiento.clickRegistrarYDespachar();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Act: intentar eliminar el ingreso original (generaría stock negativo)', async () => {
            // ir al tab de ingresos
            await listadoMovimientos.clickTabPorIndice(1);
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickEliminaElMovimiento();
            await listadoMovimientos.confirmarEliminacion();
        });

        await test.step('Assert: debe mostrar alerta de stock negativo', async () => {
            await listadoMovimientos.aceptarAlertaStockNegativo();
        });
    });
});
