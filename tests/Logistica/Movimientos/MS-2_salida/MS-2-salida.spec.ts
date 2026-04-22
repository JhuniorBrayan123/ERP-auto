import {expect, test} from '@fixtures/Logistica/movimientos-fixture';
import {
    ALMACENES,
    ITEMS_TEST,
    MOTIVOS_SALIDA,
    PATRON_CODIGO,
    PROVEEDOR_EXISTENTE,
    VARIANTES,
} from '@helpers/Logistica/movimiento-data.helper';
import {KardexVerificacionPage} from '@pages/Logistica/KardexVerificacionPage';
import {
    buscarYSeleccionarItem,
    definirAlmacenYMotivo,
    registrarSalidaYDespachar,
    verificarKardexDesdeStock,
    verificarStockPorCodigoYClick
} from '@helpers/Logistica/verificaciones-movimientos.helper';

test.describe('MS-2 | Salidas de Almacén @salida', {tag: ['@logistica', '@movimientos']}, () => {

    test('Registrar salida correctamente y reflejar disminución de stock @MS-2', async ({
                                                                                            movimientosNav,
                                                                                            registroMovimiento,
                                                                                            resultadoMovimiento,
                                                                                            stockVerificacion,
                                                                                        }) => {

        await test.step('Given: navegar a Salidas', async () => {
            await movimientosNav.navegarASalidas();
            await registroMovimiento.clickNuevoMovimiento();
        });
        await definirAlmacenYMotivo(registroMovimiento, ALMACENES.AUTO, ALMACENES.VENTAS, MOTIVOS_SALIDA.VENTA, MOTIVOS_SALIDA.VENTA);
        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.PRODUCTO_GRAVADO.codigo, ITEMS_TEST.PRODUCTO_GRAVADO.nombre);
        await test.step('And: definir cantidad', async () => {
            await registroMovimiento.llenarCantidad('10');
        });
        await registrarSalidaYDespachar(registroMovimiento, resultadoMovimiento);
        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.PRODUCTO_GRAVADO.codigo, async () => {
            await stockVerificacion.clickFlechaExpandir();
        });
        await verificarKardexDesdeStock(stockVerificacion, ALMACENES.VENTAS, PATRON_CODIGO.SALIDA);
    });

    test('Registrar salida con insumo @MS-2', async ({
                                                         movimientosNav,
                                                         registroMovimiento,
                                                         resultadoMovimiento,
                                                         stockVerificacion,
                                                         kardexVerificacion,
                                                         page,
                                                     }) => {
        test.setTimeout(120_000)

        await test.step('Given: navegar a Salidas y crear nueva', async () => {
            await movimientosNav.navegarASalidasDesdeMenu();
            await registroMovimiento.clickNuevoMovimiento();
        });

        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.INSUMO_FLEXIBLE.codigo, ITEMS_TEST.INSUMO_FLEXIBLE.nombre);

        await registrarSalidaYDespachar(registroMovimiento, resultadoMovimiento);

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.INSUMO_FLEXIBLE.codigo);

        await test.step('And: verificar movimiento en kardex', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.INSUMO_FLEXIBLE.nombre)
            await kardexVerificacion.clickAlmacenMultiple();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await kardexVerificacion.clickCodigoMovimientoRegex(PATRON_CODIGO.SALIDA);
            await kardexVerificacion.cerrarModalDetalle();
        });
    });

    test('Registrar salida con variante @MS-2', async ({
                                                           movimientosNav,
                                                           registroMovimiento,
                                                           resultadoMovimiento,
                                                           stockVerificacion,
                                                           page,
                                                       }) => {

        await test.step('Given: estar en lista de salidas y crear nueva', async () => {
            await movimientosNav.navegarASalidas()
            await registroMovimiento.clickNuevoMovimiento();
        });
        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.VARIANTE_FLEXIBLE.codigo, ITEMS_TEST.VARIANTE_FLEXIBLE.nombre);
        await test.step('When: seleccionar variante', async () => {
            await registroMovimiento.seleccionarVariante(VARIANTES.V2_FLEXIBLE.nombre);
        });
        await registrarSalidaYDespachar(registroMovimiento, resultadoMovimiento, true);

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.VARIANTE_FLEXIBLE.codigo, async () => {
            await stockVerificacion.clickVariante(VARIANTES.V2_FLEXIBLE.nombre);
        });

        await test.step('And: verificar kardex de la variante', async () => {
            const kardexPage = await stockVerificacion.abrirKardexVariante('313131-V002 Variante 2');
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await expect(kardexPage.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
            await kardexPopup.cerrarModalDetalle()
        });
    });

    test('Registrar salida con ítem con equivalencia @MS-2', async ({
                                                                        movimientosNav,
                                                                        registroMovimiento,
                                                                        resultadoMovimiento,
                                                                        stockVerificacion,
                                                                        page,
                                                                    }) => {

        await test.step('Given: crear nueva salida con almacén VENTAS', async () => {
            await movimientosNav.navegarASalidas()
            await registroMovimiento.clickNuevoMovimiento();
            await registroMovimiento.seleccionarAlmacen(ALMACENES.AUTO, ALMACENES.VENTAS);
            await page.getByText(MOTIVOS_SALIDA.VENTA).first().click();
            await page.getByText(MOTIVOS_SALIDA.INSUMOS).click();
        });
        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.EQUIVALENTE_FLEX.codigo, ITEMS_TEST.EQUIVALENTE_FLEX.nombre);
        await test.step('When: registrar equivalencia', async () => {
            await page.getByText(ITEMS_TEST.EQUIVALENTE_FLEX.nombre).first().click();
        });
        await registrarSalidaYDespachar(registroMovimiento, resultadoMovimiento);
        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.EQUIVALENTE_FLEX.codigo);
        await verificarKardexDesdeStock(stockVerificacion, ALMACENES.VENTAS, PATRON_CODIGO.SALIDA);
    });

    test('Despachar salida correctamente liberando stock comprometido @MS-2', async ({
                                                                                         movimientosNav,
                                                                                         registroMovimiento,
                                                                                         resultadoMovimiento,
                                                                                         listadoMovimientos,
                                                                                         stockVerificacion,
                                                                                     }) => {
        test.setTimeout(120_000);

        await test.step('Given: navegar a Salidas y crear salida solo registrar (sin despacho)', async () => {
            await movimientosNav.navegarASalidasDesdeMenu();
            await registroMovimiento.clickAgregarSalida();
        });

        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.VARIANTE_FLEXIBLE.codigo, ITEMS_TEST.VARIANTE_FLEXIBLE.nombre);

        await test.step('And: registrar sin despachar', async () => {
            await registroMovimiento.seleccionarVariante(VARIANTES.V3_FLEXIBLE.nombre);
            await registroMovimiento.clickTextoRegistrarSalida();
            await registroMovimiento.clickRegistrarSoloSalida();
            await resultadoMovimiento.irAlListado();
        });

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.VARIANTE_FLEXIBLE.codigo, async () => {
            await stockVerificacion.clickStockComprometido();
        });

        await test.step('When: despachar la salida desde el listado', async () => {
            await movimientosNav.navegarASalidas();
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickDespacharSalida();
            await listadoMovimientos.confirmarDespacho();
            await listadoMovimientos.cerrarModal();
        });

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.VARIANTE_FLEXIBLE.codigo, async () => {
            await stockVerificacion.clickVariante(VARIANTES.V3_FLEXIBLE.nombre);
        });

        await test.step('And: verificar kardex de variante', async () => {
            const kardexPage = await stockVerificacion.abrirKardexVariante('313131-V003 Variante 3');
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await expect(kardexPage.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
            await kardexPopup.cerrarModalDetalle()
        });
    });

    test('Registrar salida con datos adicionales @MS-2', async ({
                                                                    movimientosNav,
                                                                    registroMovimiento,
                                                                    datosOpcionales,
                                                                    resultadoMovimiento,
                                                                    stockVerificacion,
                                                                    page,
                                                                }) => {
        test.setTimeout(180_000)

        await test.step('Given: crear nueva salida', async () => {
            await movimientosNav.navegarASalidas();
            await registroMovimiento.clickAgregarSalida();
        });

        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.PRODUCTO_GRAVADO.codigo, ITEMS_TEST.PRODUCTO_GRAVADO.nombre);

        await test.step('When: configurar datos opcionales', async () => {
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.buscarCliente(PROVEEDOR_EXISTENTE.numDocumento);
            await page.getByText(`DNIDNI${PROVEEDOR_EXISTENTE.numDocumento}99999999JHUNIOR`).click();
            await datosOpcionales.guardarDatos();
        });

        await registrarSalidaYDespachar(registroMovimiento, resultadoMovimiento, true); // clickTextoRegistrarSalida

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.PRODUCTO_GRAVADO.codigo);

        await test.step('And: verificar kardex y datos opcionales', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await expect(kardexPage.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
            await kardexPopup.clickCodigoMovimientoRegex(PATRON_CODIGO.SALIDA)
            await kardexPopup.clickDatosOpcionales();
            await kardexPopup.cerrarModalDetalle();
        });
    });
});
