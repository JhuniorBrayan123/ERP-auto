import {expect, test} from '@fixtures/Logistica/movimientos-fixture';
import {
    ALMACENES,
    ITEMS_TEST,
    MOTIVOS_INGRESO,
    PATRON_CODIGO,
    PROVEEDOR_EXISTENTE,
} from '@helpers/Logistica/movimiento-data.helper';
import {
    buscarYSeleccionarItem,
    definirAlmacenYMotivo,
    definirCantidadYRegistrarIngreso,
    navegarAIngresosYNuevo,
    verificarStockPorCodigoYClick,
    verificarStockYKardex,
} from '@helpers/Logistica/verificaciones-movimientos.helper';
import {KardexVerificacionPage} from '@pages/Logistica/KardexVerificacionPage';

test.describe('MS-1 | Ingresos de Almacén @ingreso', {tag: ['@logistica', '@m                                                                                                                                                                                             ovimientos']}, () => {

    test('Registrar ingreso de almacén correctamente con producto y reflejar aumento de stock @MS-1', async ({
                                                                                                                 movimientosNav,
                                                                                                                 registroMovimiento,
                                                                                                                 resultadoMovimiento,
                                                                                                                 stockVerificacion,
                                                                                                                 kardexVerificacion,
                                                                                                                 page,
                                                                                                                 kardexApi,
                                                                                                             }) => {
        let saldoAfectadoApi = 0;
        await navegarAIngresosYNuevo(movimientosNav, registroMovimiento);
        await definirAlmacenYMotivo(registroMovimiento, ALMACENES.AUTO, ALMACENES.AUTO, 'INGRESO A ALMACÉN', MOTIVOS_INGRESO.ABASTECIMIENTO);
        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.PRODUCTO_ESTRICTO.codigo, ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
        await test.step('API kardex: antes del ingreso', async () => {
            saldoAfectadoApi = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_TEST.PRODUCTO_ESTRICTO.codigo,
                almacenFiltro: 'AUTO',
            });
        });
        await definirCantidadYRegistrarIngreso(registroMovimiento, '150');
        await test.step('And: ir al listado de movimientos', async () => {
            await resultadoMovimiento.irAlListado();
            await page.waitForTimeout(2000)
        });
        await verificarStockYKardex(
            movimientosNav, stockVerificacion, kardexVerificacion, page,
            ITEMS_TEST.PRODUCTO_ESTRICTO.codigo, ALMACENES.AUTO, PATRON_CODIGO.INGRESO
        );
        await test.step('Asser API: verificar kardex en DB', async () => {
            const saldoPosIngreso = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_TEST.PRODUCTO_ESTRICTO.codigo,
                almacenFiltro: 'AUTO',
            });
            expect(saldoPosIngreso).toBe(saldoAfectadoApi + 150)
        })
        await test.step('And: regresar a Ingresos', async () => {
            await movimientosNav.navegarAIngresos();
        });
    });

    test('Registrar ingreso con ítem con variante @MS-1', async ({
                                                                     movimientosNav,
                                                                     registroMovimiento,
                                                                     resultadoMovimiento,
                                                                     stockVerificacion,
                                                                     kardexVerificacion,
                                                                     page,
                                                                 }) => {

        await navegarAIngresosYNuevo(movimientosNav, registroMovimiento);
        await definirAlmacenYMotivo(registroMovimiento, ALMACENES.AUTO, ALMACENES.AUTO, 'INGRESO A ALMACÉN', MOTIVOS_INGRESO.COMPRAS);
        await test.step('And: buscar ítem y seleccionar variante', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.VARIANTE_FLEXIBLE.nombre);
            await registroMovimiento.seleccionarVariante('Variante 1 flexible');
        });

        await definirCantidadYRegistrarIngreso(registroMovimiento, '10', resultadoMovimiento);

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.VARIANTE_FLEXIBLE.codigo, async () => {
            await stockVerificacion.clickVariante('Variante 1 flexible');
        });

        await test.step('And: verificar movimiento en kardex de la variante', async () => {
            const kardexPage = await stockVerificacion.abrirKardexVariante('313131-V001 Variante 1');
            const kardexPopup = new KardexVerificacionPage(kardexPage);
        });
    });

    test('Registrar ingreso con ítem con equivalencia @MS-1', async ({
                                                                         movimientosNav,
                                                                         registroMovimiento,
                                                                         resultadoMovimiento,
                                                                         stockVerificacion,
                                                                     }) => {
        test.setTimeout(180_000)

        await navegarAIngresosYNuevo(movimientosNav, registroMovimiento);
        await definirAlmacenYMotivo(registroMovimiento, ALMACENES.AUTO, ALMACENES.VENTAS, 'INGRESO A ALMACÉN', MOTIVOS_INGRESO.TRASLADO);

        await test.step('And: buscar ítem con equivalencia y seleccionar equivalente', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.EQUIVALENTE_FLEX.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.EQUIVALENTE_FLEX.nombre);
            await registroMovimiento.seleccionarEquivalente('Equivalente X2');
        });
        await definirCantidadYRegistrarIngreso(registroMovimiento, '10', resultadoMovimiento);
        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.EQUIVALENTE_FLEX.codigo, async () => {
            await stockVerificacion.clickAlmacenMultiple();
        });
        await test.step('And: verificar movimiento en kardex', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
            const kardexPopup = new KardexVerificacionPage(kardexPage);
        });
    });

    test('Validar cantidad inválida en ingreso @MS-1', async ({
                                                                  movimientosNav,
                                                                  registroMovimiento,
                                                                  page,
                                                              }) => {
        test.setTimeout(180_000)

        await navegarAIngresosYNuevo(movimientosNav, registroMovimiento, true);

        await test.step('When: seleccionar almacén, motivo y agregar ítem con cantidad cero', async () => {
            // await registroMovimiento.seleccionarAlmacen(ALMACENES.AUTO, ALMACENES.AUTO);
            // await registroMovimiento.abrirSelectorMotivo();
            await definirAlmacenYMotivo(registroMovimiento, ALMACENES.AUTO, ALMACENES.AUTO, 'INGRESO A ALMACÉN', MOTIVOS_INGRESO.TRASLADO);
            // await registroMovimiento.seleccionarMotivoDirecto(MOTIVOS_INGRESO.TRASLADO);
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
            await registroMovimiento.llenarCantidad('0000');
        });

        await test.step('And: intentar registrar el ingreso', async () => {
            await registroMovimiento.clickRegistrarIngreso();
        });

        await test.step('Then: debe mostrar mensaje de error de cantidad inválida', async () => {
            await expect(
                page.getByText('Error al generar MovimientoLas cantidades de los ítems deben ser mayores a cero.'),
            ).toBeVisible();
        });

        await test.step('And: cerrar el error y cancelar', async () => {
            await registroMovimiento.cerrarModal();
            await registroMovimiento.clickCancelar();
        });
    });

    test('Validar duplicidad de ítems en ingreso @MS-1', async ({
                                                                    movimientosNav,
                                                                    registroMovimiento,
                                                                }) => {

        await navegarAIngresosYNuevo(movimientosNav, registroMovimiento, true);
        await test.step('When: agregar el mismo ítem dos veces', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
        });

        await test.step('Then: verificar que la cantidad incrementó (no se creó fila duplicada)', async () => {
            await registroMovimiento.cantidadInput.click();
        });

        await test.step('And: limpiar y cancelar', async () => {
            await registroMovimiento.clickLimpiar();
            await registroMovimiento.clickLimpiarConfirmacion();
            // await registroMovimiento.cerrarModal();
            // await registroMovimiento.clickCancelar();
        });
    });

    test('Registrar ingreso con datos adicionales @MS-1', async ({
                                                                     movimientosNav,
                                                                     registroMovimiento,
                                                                     datosOpcionales,
                                                                     resultadoMovimiento,
                                                                     stockVerificacion,
                                                                     kardexVerificacion,
                                                                     page,
                                                                 }) => {


        await navegarAIngresosYNuevo(movimientosNav, registroMovimiento, true);

        await test.step('When: abrir datos opcionales y crear proveedor nuevo', async () => {
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.buscarProveedor(PROVEEDOR_EXISTENTE.numDocumento);
            await datosOpcionales.seleccionarProveedor(PROVEEDOR_EXISTENTE.nombre);
        });

        await test.step('And: guardar datos opcionales', async () => {
            await datosOpcionales.guardarDatos();
        });
        await test.step('And: buscar ítem, definir cantidad y registrar', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
        });
        await definirCantidadYRegistrarIngreso(registroMovimiento, '10', resultadoMovimiento);
        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.PRODUCTO_ESTRICTO.codigo, async () => {
            await stockVerificacion.clickAlmacenMultiple();
        });
        await test.step('And: verificar movimiento y datos opcionales en kardex', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);//modificado en almacen de auto a VENTAS
            await kardexPopup.clickCodigoMovimientoRegex(PATRON_CODIGO.INGRESO);
            await kardexPopup.clickDatosOpcionales();
            await kardexPopup.cerrarModalDetalle();
        });
    });
});
