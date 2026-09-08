import { test } from '@fixtures/Logistica/movimientos-fixture';
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
import { esperarCargaOverlaySiVisible } from '@utils/wait-helpers';

test.describe('MS-05 | Edición de Movimientos', { tag: ['@logistica', '@movimientos'] }, () => {

    test('SC-01: Editar movimiento correctamente (cantidad) @MS-05.1', async ({
        movimientosNav,
        registroMovimiento,
        resultadoMovimiento,
        listadoMovimientos,
        stockVerificacion,
        kardexVerificacion,
        page,
    }) => {
        test.setTimeout(120_000)

        await crearIngresoEstandarParaPrecondicion(movimientosNav, registroMovimiento, resultadoMovimiento, page, ITEMS_TEST.ESTRICTO_GRAVADO_8.codigo, ITEMS_TEST.ESTRICTO_GRAVADO_8.nombre, '100', true);

        await editarCantidadDeMovimiento(listadoMovimientos, registroMovimiento, '10');

        await verificarBitacoraEdicion(listadoMovimientos, ['Creación', 'Actualización']);

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.ESTRICTO_GRAVADO_8.codigo);

        await verificarKardexTotalEstandar(movimientosNav, kardexVerificacion, page, ITEMS_TEST.ESTRICTO_GRAVADO_8.codigo, ALMACENES.AUTO, PATRON_CODIGO.INGRESO);
    });

    test('SC-02: Editar movimiento con variante @MS-05.2', async ({
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
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await page.getByRole('cell', { name: VARIANTES.V2_FLEXIBLE.nombre }).click();
            await page.getByRole('row', { name: VARIANTES.V2_FLEXIBLE.codigo }).getByRole('button').click();
        });
    });

    test('SC-03: Editar movimiento con control estricto válido @MS-05.3', async ({
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

    test('SC-04: Bloquear edición por integridad @MS-05.4', async ({
        movimientosNav,
        registroMovimiento,
        resultadoMovimiento,
        listadoMovimientos,
        page,
    }) => {
        
        await test.step('Arrange: crear salida para intentar editar', async () => {
            await movimientosNav.navegarASalidasDesdeMenu();
            await registroMovimiento.clickAgregarSalida();
            await esperarCargaOverlaySiVisible(page);
            await registroMovimiento.buscarItem(ITEMS_TEST.ESTRICTO_GRAVADO_8.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.ESTRICTO_GRAVADO_8.nombre);
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
            
        });
    });

    test('SC-05: Editar movimiento con datos adicionales @MS-05.5', async ({
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
            await registroMovimiento.buscarItem(ITEMS_TEST.ESTRICTO_GRAVADO_8.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.ESTRICTO_GRAVADO_8.nombre);

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
