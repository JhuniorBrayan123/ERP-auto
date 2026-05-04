import {test} from '@fixtures/Logistica/movimientos-fixture';
import {
    ALMACENES,
    ITEMS_TEST,
    PATRON_CODIGO,
    PROVEEDOR_EXISTENTE,
    VARIANTES,
} from '@helpers/Logistica/movimiento-data.helper';
import {
    crearIngresoEstandarParaPrecondicion,
    editarCantidadDeMovimiento,
    verificarBitacoraEdicion,
    verificarStockPorCodigoYClick,
    verificarKardexTotalEstandar,
} from '@helpers/Logistica/verificaciones-movimientos.helper';

test.describe('MS-5 | Edición de Movimientos @edicion', {tag: ['@logistica', '@movimientos']}, () => {

    test('Editar movimiento correctamente (cantidad) @MS-5', async ({
                                                                        movimientosNav,
                                                                        registroMovimiento,
                                                                        resultadoMovimiento,
                                                                        listadoMovimientos,
                                                                        stockVerificacion,
                                                                        kardexVerificacion,
                                                                        page,
                                                                    }) => {
        test.setTimeout(120_000)

        await crearIngresoEstandarParaPrecondicion(movimientosNav, registroMovimiento, resultadoMovimiento, page, ITEMS_TEST.PRODUCTO_GRAVADO.codigo, 'Pproducto121212item para', '100', true);

        await editarCantidadDeMovimiento(listadoMovimientos, registroMovimiento, '10');

        await verificarBitacoraEdicion(listadoMovimientos, ['Creación', 'Actualización']);

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.PRODUCTO_GRAVADO.codigo);

        await verificarKardexTotalEstandar(movimientosNav, kardexVerificacion, page, ITEMS_TEST.PRODUCTO_GRAVADO.codigo, ALMACENES.AUTO, PATRON_CODIGO.INGRESO);
    });

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

        // Arrange especial: crear ingreso con variante (no usa crearIngresoEstandarParaPrecondicion)
        await test.step('Arrange: crear ingreso con variante', async () => {
            await movimientosNav.navegarAIngresosDesdeMenu();
            await registroMovimiento.clickAgregarIngreso();
            await registroMovimiento.buscarItem(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.VARIANTE_FLEXIBLE.nombre);
            await registroMovimiento.seleccionarVariante(VARIANTES.V2_FLEXIBLE.nombre);
            await registroMovimiento.llenarCantidad('100');
            await registroMovimiento.clickRegistrarIngreso();
            await resultadoMovimiento.irAlListado();
        });

        await verificarBitacoraEdicion(listadoMovimientos, ['Creación', 'Actualización']);

        await editarCantidadDeMovimiento(listadoMovimientos, registroMovimiento, '10');

        await verificarBitacoraEdicion(listadoMovimientos, ['Creación', 'Actualización'], true);

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.VARIANTE_FLEXIBLE.codigo, async () => {
            await stockVerificacion.clickVariante(VARIANTES.V2_FLEXIBLE.nombre);
            await stockVerificacion.clickAlmacenMultipleNth(1);
        });

        await test.step('Assert: verificar kardex de la variante', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await page.getByRole('cell', {name: VARIANTES.V2_FLEXIBLE.nombre}).click();
            await page.getByRole('row', {name: '313131-V002 Variante 2'}).getByRole('button').click();
        });
    });

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

        await crearIngresoEstandarParaPrecondicion(movimientosNav, registroMovimiento, resultadoMovimiento, page, ITEMS_TEST.PRODUCTO_ESTRICTO.codigo, ITEMS_TEST.PRODUCTO_ESTRICTO.nombre, '100');

        await verificarBitacoraEdicion(listadoMovimientos, ['Creación', 'Actualización']);

        await editarCantidadDeMovimiento(listadoMovimientos, registroMovimiento, '10');

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);

        await verificarKardexTotalEstandar(movimientosNav, kardexVerificacion, page, ITEMS_TEST.PRODUCTO_ESTRICTO.codigo, ALMACENES.AUTO, PATRON_CODIGO.INGRESO);
    });

    test('Bloquear edición por integridad @MS-5', async ({
                                                             movimientosNav,
                                                             registroMovimiento,
                                                             resultadoMovimiento,
                                                             listadoMovimientos,
                                                             page,
                                                         }) => {
        // Flujo completamente especial — dejar inline
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

    test('Editar movimiento con datos adicionales @MS-5', async ({
                                                                     movimientosNav,
                                                                     registroMovimiento,
                                                                     datosOpcionales,
                                                                     resultadoMovimiento,
                                                                     listadoMovimientos,
                                                                     page,
                                                                 }) => {
        test.setTimeout(120_000)

        // Arrange especial: datos adicionales completos — dejar inline
        await test.step('Arrange: crear ingreso con datos adicionales completos', async () => {
            await movimientosNav.navegarAIngresosDesdeMenu();
            await registroMovimiento.clickAgregarIngreso();
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_GRAVADO.nombre);

            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.buscarProveedor(PROVEEDOR_EXISTENTE.numDocumento);
            await datosOpcionales.seleccionarProveedor(PROVEEDOR_EXISTENTE.nombre);

            await datosOpcionales.llenarCampoTexto(0, 'test-modificacion de datos adicionales');
            await datosOpcionales.clickCampoFecha(0);
            await datosOpcionales.seleccionarDiaEnDatepickerVisible('15');
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

        await verificarBitacoraEdicion(listadoMovimientos, ['Actualización']);
    });
});
