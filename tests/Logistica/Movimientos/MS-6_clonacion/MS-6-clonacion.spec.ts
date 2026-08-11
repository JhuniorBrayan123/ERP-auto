import {test} from '@fixtures/Logistica/movimientos-fixture';
import {ALMACENES, ITEMS_TEST, PATRON_CODIGO, PROVEEDOR_EXISTENTE, VARIANTES} from '@helpers/Logistica/movimiento-data.helper';
import {
    clonarMovimientoDesdeListado,
    crearIngresoBaseParaClonacion,
    verificarBitacoraEdicion,
} from '@helpers/Logistica/verificaciones-movimientos.helper';

test.describe('MS-06 | Clonación de Movimientos', {tag: ['@logistica', '@movimientos']}, () => {

    test('SC-01: Clonar movimiento correctamente @MS-06.1', async ({
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
            ITEMS_TEST.ESTRICTO_GRAVADO_9.codigo, ITEMS_TEST.ESTRICTO_GRAVADO_9.nombre,
        );

        await test.step('And: verificar stock antes de clonar', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.ESTRICTO_GRAVADO_9.codigo);
            await stockVerificacion.clickVariosTexto();
        });

        await test.step('Act: navegar a ingresos y clonar', async () => {
            await movimientosNav.navegarAIngresos();
        });

        await clonarMovimientoDesdeListado(listadoMovimientos, registroMovimiento);

        await verificarBitacoraEdicion(listadoMovimientos, []);

        await test.step('Assert: verificar nuevo movimiento en kardex', async () => {
            await movimientosNav.navegarAKardexTotal();
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.ESTRICTO_GRAVADO_9.codigo);
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await kardexVerificacion.expectPatronCodigoMovimientoVisible(PATRON_CODIGO.INGRESO);

            await kardexVerificacion.clickCodigoMovimientoRegex(PATRON_CODIGO.INGRESO);
            await kardexVerificacion.cerrarModalDetalle();
        });
    });

    test('SC-02: Clonar movimiento con equivalencia @MS-06.2', async ({
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
            {waitAntes: page, seleccionarEquivalente: VARIANTES.EQUIVALENTE_X2},
        );

        await test.step('Act: ver movimiento y luego clonar', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerMovimiento();
            await listadoMovimientos.cerrarModal();
        });

        await clonarMovimientoDesdeListado(listadoMovimientos, registroMovimiento);

        await test.step('Assert: verificar kardex del movimiento clonado', async () => {
            await movimientosNav.navegarAKardexTotal();
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.EQUIVALENTE_FLEX.codigo);
            await kardexVerificacion.clickVariosTexto();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await kardexVerificacion.expectPatronCodigoMovimientoVisible(PATRON_CODIGO.INGRESO);
            await kardexVerificacion.cerrarModalDetalle();
        });
    });

    test('SC-03: Clonar movimiento con datos adicionales @MS-06.3', async ({
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
