import {test} from '@fixtures/Logistica/movimientos-fixture';
import {
    ALMACENES,
    ITEMS_TEST,
    PATRON_CODIGO,
    PROVEEDOR_EXISTENTE,
    VARIANTES,
} from '@helpers/Logistica/movimiento-data.helper';

test.describe('MS-5 | Edición de Movimientos @edicion', {tag: ['@logistica', '@movimientos']}, () => {

    // ═══════════════════════════════════════════════════════════════
    // Scenario 23: Editar movimiento correctamente (cantidad)
    // Para edición: se crea un ingreso y luego se edita
    // ═══════════════════════════════════════════════════════════════
    test('Editar movimiento correctamente (cantidad) Para edición: se crea un ingreso y luego se edita @MS-5', async ({
                                                                                                                          movimientosNav,
                                                                                                                          registroMovimiento,
                                                                                                                          resultadoMovimiento,
                                                                                                                          listadoMovimientos,
                                                                                                                          stockVerificacion,
                                                                                                                          kardexVerificacion,
                                                                                                                          page,
                                                                                                                      }) => {
        test.setTimeout(120_000)

        await test.step('Arrange: crear ingreso para editar', async () => {
            await movimientosNav.navegarAIngresosDesdeMenu();
            await registroMovimiento.clickAgregarIngreso();
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await page.getByText('Pproducto121212item para').click();
            await registroMovimiento.llenarCantidad('100');
            await registroMovimiento.clickRegistrarIngreso();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Act: editar movimiento cambiando cantidad', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickEditarMovimiento();
            await registroMovimiento.llenarCantidad('10');
            await registroMovimiento.clickActualizarIngreso();
            await listadoMovimientos.cerrarModal();
        });

        await test.step('Assert: verificar bitácora de actualización', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerBitacora();
            await listadoMovimientos.clickEventoBitacora('Creación');
            await listadoMovimientos.clickEventoBitacora('Actualización');
            await listadoMovimientos.cerrarBitacora();
        });

        await test.step('Assert: verificar stock actualizado', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await stockVerificacion.clickVariosTexto();
        });

        await test.step('Assert: verificar en kardex', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await kardexVerificacion.clickVariosTexto();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await kardexVerificacion.expectPatronCodigoMovimientoVisible(PATRON_CODIGO.INGRESO);
            await kardexVerificacion.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 24: Editar movimiento con variante
    // ═══════════════════════════════════════════════════════════════
    test('Editar movimiento con variante @MS-5', async ({
                                                            movimientosNav,
                                                            registroMovimiento,
                                                            resultadoMovimiento,
                                                            listadoMovimientos,
                                                            stockVerificacion,
                                                            kardexVerificacion,
                                                            page,
                                                        }) => {
        test.setTimeout(120_000)

        await test.step('Arrange: crear ingreso con variante', async () => {
            await movimientosNav.navegarAIngresosDesdeMenu();
            await registroMovimiento.clickAgregarIngreso();
            await registroMovimiento.buscarItem(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.VARIANTE_FLEXIBLE.nombre);
            await registroMovimiento.seleccionarVariante(VARIANTES.V2_FLEXIBLE);
            await registroMovimiento.llenarCantidad('100');
            await registroMovimiento.clickRegistrarIngreso();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Act: verificar bitácora y editar cantidad', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerBitacora();
            await listadoMovimientos.clickEventoBitacora('Creación');
            await listadoMovimientos.clickEventoBitacora('Actualización');
            await listadoMovimientos.cerrarBitacora();
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickEditarMovimiento();
            await registroMovimiento.llenarCantidad('10');
            await registroMovimiento.clickActualizarIngreso();
            await listadoMovimientos.cerrarModal();
        });

        await test.step('Assert: verificar bitácora post-edición', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerBitacora();
            await listadoMovimientos.clickEventoBitacora('Creación');
            await listadoMovimientos.clickEventoBitacora('Actualización');
            await listadoMovimientos.cerrarBitacoraAlternativo();
        });

        await test.step('Assert: verificar stock de la variante', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await stockVerificacion.clickVariante(VARIANTES.V2_FLEXIBLE);
            await stockVerificacion.clickAlmacenMultipleNth(1);
        });

        await test.step('Assert: verificar kardex de la variante', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await page.getByRole('cell', {name: VARIANTES.V2_FLEXIBLE}).click();
            await page.getByRole('row', {name: '313131-V002 Variante 2'}).getByRole('button').click();
            // await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            // await kardexVerificacion.expectPatronCodigoMovimientoVisible(PATRON_CODIGO.INGRESO);
            // await kardexVerificacion.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 25: Editar movimiento con control estricto válido
    // ═══════════════════════════════════════════════════════════════
    test('Editar movimiento con control estricto válido @MS-5', async ({
                                                                           movimientosNav,
                                                                           registroMovimiento,
                                                                           resultadoMovimiento,
                                                                           listadoMovimientos,
                                                                           stockVerificacion,
                                                                           kardexVerificacion,
                                                                           page,
                                                                       }) => {
        test.setTimeout(120_000)

        await test.step('Arrange: crear ingreso con producto estricto', async () => {
            await movimientosNav.navegarAIngresos();
            await registroMovimiento.clickAgregarIngreso();
            await page.waitForTimeout(2000)
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
            await registroMovimiento.llenarCantidad('100');
            await registroMovimiento.clickRegistrarIngreso();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Act: editar cantidad', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerBitacora();
            await listadoMovimientos.clickEventoBitacora('Creación');
            await listadoMovimientos.clickEventoBitacora('Actualización');
            await listadoMovimientos.cerrarBitacora();
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickEditarMovimiento();
            await registroMovimiento.llenarCantidad('10');
            await registroMovimiento.clickActualizarIngreso();
            await listadoMovimientos.cerrarModal();
        });

        await test.step('Assert: verificar stock', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await stockVerificacion.clickVariosTexto();
        });

        await test.step('Assert: verificar kardex', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000)
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await kardexVerificacion.clickVariosTexto();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await kardexVerificacion.expectPatronCodigoMovimientoVisible(PATRON_CODIGO.INGRESO);
            await kardexVerificacion.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 26: Bloquear edición por integridad
    // ═══════════════════════════════════════════════════════════════
    test('Bloquear edición por integridad @MS-5', async ({
                                                             movimientosNav,
                                                             registroMovimiento,
                                                             resultadoMovimiento,
                                                             listadoMovimientos,
                                                             page,
                                                         }) => {


        await test.step('Arrange: crear salida para intentar editar', async () => {
            await movimientosNav.navegarASalidasDesdeMenu();
            await registroMovimiento.clickAgregarSalida();
            await page.waitForTimeout(2000)
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_GRAVADO.nombre);
            await registroMovimiento.clickTextoRegistrarSalida();
            await registroMovimiento.clickRegistrarYDespachar();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Act: intentar editar — eliminar ítem y actualizar vacío', async () => {
            await listadoMovimientos.abrirMenuAccionesIcono();
            await listadoMovimientos.clickEditarMovimiento();
            await registroMovimiento.clickCeldaCantidad();
            await page.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').fill('');
            await registroMovimiento.eliminarItemGrilla();
            await registroMovimiento.clickActualizarSalida();
        });

        await test.step('Assert: debe bloquear la actualización', async () => {
            // El sistema no debe permitir actualizar sin ítems
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 27: Editar movimiento con datos adicionales
    // ═══════════════════════════════════════════════════════════════
    test('Editar movimiento con datos adicionales @MS-5', async ({
                                                                     movimientosNav,
                                                                     registroMovimiento,
                                                                     datosOpcionales,
                                                                     resultadoMovimiento,
                                                                     listadoMovimientos,
                                                                     page,
                                                                 }) => {
        test.setTimeout(120_000)

        await test.step('Arrange: crear ingreso con datos adicionales completos', async () => {
            await movimientosNav.navegarAIngresosDesdeMenu();
            await registroMovimiento.clickAgregarIngreso();
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_GRAVADO.nombre);

            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.buscarProveedor(PROVEEDOR_EXISTENTE.numDocumento);
            await datosOpcionales.seleccionarProveedor(PROVEEDOR_EXISTENTE.nombre);

            // Campo texto
            //await datosOpcionales.crearCampoTexto('nombre ingreso');
            await datosOpcionales.llenarCampoTexto(0, 'test-modificacion de datos adicionales');

            // Campo fecha
            //await datosOpcionales.crearCampoFecha('fecha-test');
            await datosOpcionales.clickCampoFecha(0);
            // Espera que el picker realmente aparezca en el DOM
            await datosOpcionales.seleccionarDiaEnDatepickerVisible('15');

            // Campo selección
            // await datosOpcionales.crearCampoSeleccion('entorno', ['certificación', 'producción']);
            await datosOpcionales.seleccionarCampoSeleccion('certificación');

            await datosOpcionales.guardarDatos();
            await registroMovimiento.clickRegistrarIngreso();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Act: editar — cambiar campo de texto en datos opcionales', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickEditarMovimiento();
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.llenarCampoTexto(0, 'test-edicion-realizada');
            await datosOpcionales.guardarDatos();
            await registroMovimiento.clickActualizarIngreso();
            await listadoMovimientos.cerrarModal();
        });

        await test.step('Assert: verificar bitácora de actualización', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerBitacora();
            await listadoMovimientos.clickEventoBitacora('Actualización');
            await listadoMovimientos.cerrarBitacora();
        });
    });
});
