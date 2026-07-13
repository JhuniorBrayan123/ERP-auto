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
    navegarASalidasYNuevo,
    registrarSalidaYDespachar,
    verificarKardexDesdeStock,
    verificarStockPorCodigoYClick
} from '@helpers/Logistica/verificaciones-movimientos.helper';

test.describe('MS-02 | Salidas de Almacén', {tag: ['@logistica', '@movimientos']}, () => {

    test('SC-01: Registrar salida correctamente y reflejar disminución de stock @MS-02.1', async ({
                                                                                            movimientosNav,
                                                                                            registroMovimiento,
                                                                                            resultadoMovimiento,
                                                                                            stockVerificacion,
                                                                                        }) => {

        await navegarASalidasYNuevo(movimientosNav, registroMovimiento);

        await definirAlmacenYMotivo(registroMovimiento, ALMACENES.AUTO, ALMACENES.VENTAS, MOTIVOS_SALIDA.VENTA, MOTIVOS_SALIDA.VENTA);
        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.ESTRICTO_GRAVADO_6.codigo, ITEMS_TEST.ESTRICTO_GRAVADO_6.nombre);
        await test.step('And: definir cantidad', async () => {
            await registroMovimiento.llenarCantidad('10');
        });
        await registrarSalidaYDespachar(registroMovimiento, resultadoMovimiento);
        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.ESTRICTO_GRAVADO_6.codigo, async () => {
            await stockVerificacion.clickFlechaExpandir();
        });
        await verificarKardexDesdeStock(stockVerificacion, ALMACENES.VENTAS, PATRON_CODIGO.SALIDA);
    });

    test('SC-02: Registrar salida con insumo @MS-02.2', async ({
                                                         movimientosNav,
                                                         registroMovimiento,
                                                         resultadoMovimiento,
                                                         stockVerificacion,
                                                         kardexVerificacion,
                                                         page,
                                                     }) => {

        await navegarASalidasYNuevo(movimientosNav, registroMovimiento, true);
        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.INSUMO_FLEXIBLE.codigo, ITEMS_TEST.INSUMO_FLEXIBLE.nombre);
        await registrarSalidaYDespachar(registroMovimiento, resultadoMovimiento);
        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.INSUMO_FLEXIBLE.codigo);

        await test.step('And: verificar movimiento en kardex', async () => {
            await movimientosNav.navegarAKardexTotal();
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.INSUMO_FLEXIBLE.nombre)
            await kardexVerificacion.clickAlmacenMultiple();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await kardexVerificacion.clickCodigoMovimientoRegex(PATRON_CODIGO.SALIDA);
            await kardexVerificacion.cerrarModalDetalle();
        });
    });

    test('SC-03: Registrar salida con variante @MS-02.3', async ({
                                                           movimientosNav,
                                                           registroMovimiento,
                                                           resultadoMovimiento,
                                                           stockVerificacion,
                                                           page,
                                                       }) => {

        await navegarASalidasYNuevo(movimientosNav, registroMovimiento);

        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.VARIANTE_FLEXIBLE.codigo, ITEMS_TEST.VARIANTE_FLEXIBLE.nombre);
        await test.step('When: seleccionar variante', async () => {
            await registroMovimiento.seleccionarVariante(VARIANTES.V2_FLEXIBLE.nombre);
        });
        await registrarSalidaYDespachar(registroMovimiento, resultadoMovimiento, true);

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.VARIANTE_FLEXIBLE.codigo, async () => {
            await stockVerificacion.clickVariante(VARIANTES.V2_FLEXIBLE.nombre);
        });

        await test.step('And: verificar kardex de la variante', async () => {
            const kardexPage = await stockVerificacion.abrirKardexVariante(VARIANTES.V2_FLEXIBLE.codigo);
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await expect(kardexPage.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
            await kardexPopup.cerrarModalDetalle()
        });
    });

    test('SC-04: Registrar salida con ítem con equivalencia @MS-02.4', async ({
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
            await page.getByText(VARIANTES.EQUIVALENTE_X2).first().click();
        });
        await registrarSalidaYDespachar(registroMovimiento, resultadoMovimiento);
        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.EQUIVALENTE_FLEX.codigo);
        await verificarKardexDesdeStock(stockVerificacion, ALMACENES.VENTAS, PATRON_CODIGO.SALIDA);
    });

    test('SC-05: Despachar salida correctamente liberando stock comprometido @MS-02.5', async ({
                                                                                         movimientosNav,
                                                                                         registroMovimiento,
                                                                                         resultadoMovimiento,
                                                                                         listadoMovimientos,
                                                                                         stockVerificacion,
                                                                                     }) => {
        test.setTimeout(120_000);

        await navegarASalidasYNuevo(movimientosNav, registroMovimiento, true, true);

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
            const kardexPage = await stockVerificacion.abrirKardexVariante(VARIANTES.V3_FLEXIBLE.codigo);
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await expect(kardexPage.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
            await kardexPopup.cerrarModalDetalle()
        });
    });

    test('SC-06: Registrar salida con datos adicionales @MS-02.6', async ({
                                                                    movimientosNav,
                                                                    registroMovimiento,
                                                                    datosOpcionales,
                                                                    resultadoMovimiento,
                                                                    stockVerificacion,
                                                                    page,
                                                                }) => {
        test.setTimeout(180_000)

        await navegarASalidasYNuevo(movimientosNav, registroMovimiento, false, true);

        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.ESTRICTO_GRAVADO_6.codigo, ITEMS_TEST.ESTRICTO_GRAVADO_6.nombre);

        await test.step('When: configurar datos opcionales', async () => {
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.buscarCliente(PROVEEDOR_EXISTENTE.numDocumento);
            await page.getByText(`DNIDNI${PROVEEDOR_EXISTENTE.numDocumento}99999999JHUNIOR`).click();
            await datosOpcionales.guardarDatos();
        });

        await registrarSalidaYDespachar(registroMovimiento, resultadoMovimiento, true);

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.ESTRICTO_GRAVADO_6.codigo);

        await test.step('And: verificar kardex y datos opcionales', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock(ITEMS_TEST.ESTRICTO_GRAVADO_6.codigo);
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
