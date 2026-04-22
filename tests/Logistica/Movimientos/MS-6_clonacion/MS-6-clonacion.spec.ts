import {test} from '@fixtures/Logistica/movimientos-fixture';
import {ALMACENES, ITEMS_TEST, PATRON_CODIGO, PROVEEDOR_EXISTENTE,} from '@helpers/Logistica/movimiento-data.helper';
import {
    crearIngresoBaseParaClonacion,
    clonarMovimientoDesdeListado,
    verificarBitacoraEdicion,
} from '@helpers/Logistica/verificaciones-movimientos.helper';

test.describe('MS-6 | Clonación de Movimientos @clonacion', {tag: ['@logistica', '@movimientos']}, () => {

    // ═══════════════════════════════════════════════════════════════
    // Scenario 28: Clonar movimiento correctamente
    // ═══════════════════════════════════════════════════════════════
    test('Clonar movimiento correctamente @MS-6', async ({
                                                             movimientosNav,
                                                             registroMovimiento,
                                                             resultadoMovimiento,
                                                             listadoMovimientos,
                                                             stockVerificacion,
                                                             kardexVerificacion,
                                                             page,
                                                         }) => {
        test.setTimeout(180_000);

        await crearIngresoBaseParaClonacion(
            movimientosNav, registroMovimiento, resultadoMovimiento,
            ITEMS_TEST.PRODUCTO_GRAVADO.codigo, ITEMS_TEST.PRODUCTO_GRAVADO.nombre,
        );

        await test.step('And: verificar stock antes de clonar', async () => {
            await movimientosNav.navegarAStockProductos();
            await page.waitForTimeout(2000)
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await stockVerificacion.clickVariosTexto();
        });

        await test.step('Act: navegar a ingresos y clonar', async () => {
            await movimientosNav.navegarAIngresos();
        });

        await clonarMovimientoDesdeListado(listadoMovimientos, registroMovimiento);

        await verificarBitacoraEdicion(listadoMovimientos, []);

        await test.step('Assert: verificar nuevo movimiento en kardex', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000)
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await kardexVerificacion.expectPatronCodigoMovimientoVisible(PATRON_CODIGO.INGRESO);

            await kardexVerificacion.clickCodigoMovimientoRegex(PATRON_CODIGO.INGRESO);
            await kardexVerificacion.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 29: Clonar movimiento con equivalencia
    // ═══════════════════════════════════════════════════════════════
    test('Clonar movimiento con equivalencia @MS-6', async ({
                                                                movimientosNav,
                                                                registroMovimiento,
                                                                resultadoMovimiento,
                                                                listadoMovimientos,
                                                                kardexVerificacion,
                                                                stockVerificacion,
                                                                page,
                                                            }) => {
        test.setTimeout(180_000);

        await crearIngresoBaseParaClonacion(
            movimientosNav, registroMovimiento, resultadoMovimiento,
            ITEMS_TEST.EQUIVALENTE_FLEX.codigo, ITEMS_TEST.EQUIVALENTE_FLEX.nombre,
            {waitAntes: page, seleccionarEquivalente: 'Equivalente X2'},
        );

        // Paso especial: ver movimiento antes de clonar
        await test.step('Act: ver movimiento y luego clonar', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerMovimiento();
            await listadoMovimientos.cerrarModal();
        });

        await clonarMovimientoDesdeListado(listadoMovimientos, registroMovimiento);

        await test.step('Assert: verificar kardex del movimiento clonado', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000)
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.EQUIVALENTE_FLEX.codigo);
            await kardexVerificacion.clickVariosTexto();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await kardexVerificacion.expectPatronCodigoMovimientoVisible(PATRON_CODIGO.INGRESO);
            await kardexVerificacion.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 30: Clonar movimiento con datos adicionales
    // ═══════════════════════════════════════════════════════════════
    test('Clonar movimiento con datos adicionales @MS-6', async ({
                                                                     movimientosNav,
                                                                     registroMovimiento,
                                                                     datosOpcionales,
                                                                     resultadoMovimiento,
                                                                     listadoMovimientos,
                                                                     page,
                                                                 }) => {

        await crearIngresoBaseParaClonacion(
            movimientosNav, registroMovimiento, resultadoMovimiento,
            ITEMS_TEST.PRODUCTO_ESTRICTO.codigo, ITEMS_TEST.PRODUCTO_ESTRICTO.nombre,
            {
                configurarDatos: async () => {
                    await datosOpcionales.abrirDatosOpcionales();
                    await datosOpcionales.buscarProveedor(PROVEEDOR_EXISTENTE.numDocumento);
                    await datosOpcionales.seleccionarProveedor(PROVEEDOR_EXISTENTE.nombre);
                    await datosOpcionales.llenarCampoTexto(0, 'test-clonacion');
                    await datosOpcionales.seleccionarCampoSeleccion('certificación');
                    await datosOpcionales.clickCampoFecha(0);
                    await datosOpcionales.seleccionarDiaEnDatepickerVisible('15');
                    await datosOpcionales.guardarDatos();
                },
            },
        );

        await clonarMovimientoDesdeListado(listadoMovimientos, registroMovimiento, async () => {
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.llenarCampoTexto(0, 'test-clonacion hecha');
            await datosOpcionales.guardarDatos();
        });
    });
});
