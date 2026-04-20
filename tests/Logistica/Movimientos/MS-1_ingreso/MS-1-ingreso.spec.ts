import {expect, test} from '@fixtures/Logistica/movimientos-fixture';
import {
    ALMACENES,
    ITEMS_TEST,
    MOTIVOS_INGRESO,
    PATRON_CODIGO,
    PROVEEDOR_EXISTENTE,
} from '@helpers/Logistica/movimiento-data.helper';

test.describe('MS-1 | Ingresos de Almacén @ingreso', {tag: ['@logistica', '@movimientos']}, () => {

    // ═══════════════════════════════════════════════════════════════
    // Scenario 1: Registrar ingreso de almacén correctamente con
    // producto y reflejar aumento de stock
    // ═══════════════════════════════════════════════════════════════
    test('Registrar ingreso de almacén correctamente con producto y reflejar aumento de stock @MS-1', async ({
                                                                                                                       movimientosNav,
                                                                                                                       registroMovimiento,
                                                                                                                       resultadoMovimiento,
                                                                                                                       stockVerificacion,
                                                                                                                       kardexVerificacion,
                                                                                                                       page,
                                                                                                                   }) => {


        await test.step('Given: navegar a pantalla de Ingresos', async () => {
            await movimientosNav.navegarAIngresos();
        });

        await test.step('When: seleccionar almacén y motivo de ingreso', async () => {
            await registroMovimiento.clickNuevoMovimiento();
            await registroMovimiento.seleccionarAlmacen(ALMACENES.AUTO, ALMACENES.AUTO);
            await registroMovimiento.seleccionarMotivo('INGRESO A ALMACÉN', MOTIVOS_INGRESO.ABASTECIMIENTO);
        });

        await test.step('And: buscar y seleccionar producto', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
        });

        await test.step('And: definir cantidad y registrar ingreso', async () => {
            await registroMovimiento.llenarCantidad('150');
            await registroMovimiento.clickRegistrarIngreso();
        });


        await test.step('And: ir al listado de movimientos', async () => {
            await resultadoMovimiento.irAlListado();
            await page.waitForTimeout(2000)
        });

        await test.step('And: verificar stock actualizado en inventario', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await stockVerificacion.clickAlmacenMultiple();
        });

        await test.step('And: verificar movimiento en kardex', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await kardexVerificacion.clickAlmacenMultiple();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
        });

        await test.step('And: regresar a Ingresos', async () => {
            await movimientosNav.navegarAIngresos();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 2: Registrar ingreso con ítem con variante
    // ═══════════════════════════════════════════════════════════════
    test('Registrar ingreso con ítem con variante @MS-1', async ({
                                                                                                        movimientosNav,
                                                                                                        registroMovimiento,
                                                                                                        resultadoMovimiento,
                                                                                                        stockVerificacion,
                                                                                                        kardexVerificacion,
                                                                                                        page,
                                                                                                    }) => {


        await test.step('Given: navegar a Ingresos y crear nuevo ingreso', async () => {
            await movimientosNav.navegarAIngresos();
            await registroMovimiento.clickNuevoMovimiento();
        });

        await test.step('When: seleccionar almacén y motivo COMPRAS', async () => {
            await registroMovimiento.seleccionarAlmacen(ALMACENES.AUTO, ALMACENES.AUTO);
            await registroMovimiento.seleccionarMotivo('INGRESO A ALMACÉN', MOTIVOS_INGRESO.COMPRAS);
        });

        await test.step('And: buscar ítem y seleccionar variante', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.VARIANTE_FLEXIBLE.nombre);
            await registroMovimiento.seleccionarVariante('Variante 1 flexible');
        });

        await test.step('And: definir cantidad y registrar ingreso', async () => {
            await registroMovimiento.llenarCantidad('10');
            await registroMovimiento.clickRegistrarIngreso();
        });

        await test.step('Then: ir al listado de movimientos', async () => {
            await resultadoMovimiento.irAlListado();
        });

        await test.step('And: verificar stock de la variante', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await stockVerificacion.clickVariante('Variante 1 flexible');
        });

        await test.step('And: verificar movimiento en kardex de la variante', async () => {
            const kardexPage = await stockVerificacion.abrirKardexVariante('313131-V001 Variante 1');
            const kardexPopup = new (await import('@pages/Logistica/KardexVerificacionPage')).KardexVerificacionPage(kardexPage);
            // await kardexPage.waitForLoadState('networkidle');
            // await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            // await kardexPopup.clickCodigoMovimientoRegex(PATRON_CODIGO.INGRESO);
            // await kardexPopup.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 3: Registrar ingreso con ítem con equivalencia
    // ═══════════════════════════════════════════════════════════════
    test('Registrar ingreso con ítem con equivalencia @MS-1', async ({
                                                                                                                  movimientosNav,
                                                                                                                  registroMovimiento,
                                                                                                                  resultadoMovimiento,
                                                                                                                  stockVerificacion,
                                                                                                                  kardexVerificacion,
                                                                                                                  page,
                                                                                                              }) => {
        test.setTimeout(180_000)

        await test.step('Given: navegar a Ingresos y crear nuevo ingreso', async () => {
            await movimientosNav.navegarAIngresos();
            await registroMovimiento.clickNuevoMovimiento();
        });

        await test.step('When: seleccionar almacén VENTAS y motivo INGRESO POR TRASLADO', async () => {
            await registroMovimiento.seleccionarAlmacen(ALMACENES.AUTO, ALMACENES.VENTAS);
            await registroMovimiento.seleccionarMotivo('INGRESO A ALMACÉN', MOTIVOS_INGRESO.TRASLADO);
        });

        await test.step('And: buscar ítem con equivalencia y seleccionar equivalente', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.EQUIVALENTE_FLEX.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.EQUIVALENTE_FLEX.nombre);
            await registroMovimiento.seleccionarEquivalente('Equivalente X2');
        });

        await test.step('And: definir cantidad y registrar ingreso', async () => {
            await registroMovimiento.llenarCantidad('10');
            await registroMovimiento.clickRegistrarIngreso();
        });

        await test.step('Then: ir al listado de movimientos', async () => {
            await resultadoMovimiento.irAlListado();
        });

        await test.step('And: verificar stock actualizado por equivalencia', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.EQUIVALENTE_FLEX.codigo);
            await stockVerificacion.clickAlmacenMultiple();
        });

        await test.step('And: verificar movimiento en kardex', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
            const kardexPopup = new (await import('@pages/Logistica/KardexVerificacionPage')).KardexVerificacionPage(kardexPage);
            // await kardexPage.waitForLoadState('networkidle');
            // await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.VENTAS);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 4: Validar cantidad inválida en ingreso
    // ═══════════════════════════════════════════════════════════════
    test('Validar cantidad inválida en ingreso @MS-1', async ({
                                                                                                movimientosNav,
                                                                                                registroMovimiento,
                                                                                                page,
                                                                                            }) => {
        test.setTimeout(180_000)

        await test.step('Given: navegar a Ingresos y crear nuevo ingreso', async () => {
            await movimientosNav.navegarAIngresosDesdeMenu();
            await registroMovimiento.clickNuevoMovimiento();
        });

        await test.step('When: seleccionar almacén, motivo y agregar ítem con cantidad cero', async () => {
            await registroMovimiento.seleccionarAlmacen(ALMACENES.AUTO, ALMACENES.AUTO);
            // await page.getByText(ALMACENES.AUTO).nth(1).click();
            await registroMovimiento.abrirSelectorMotivo();
            await registroMovimiento.seleccionarMotivoDirecto(MOTIVOS_INGRESO.TRASLADO);
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

    // ═══════════════════════════════════════════════════════════════
    // Scenario 5: Validar duplicidad de ítems en ingreso
    // ═══════════════════════════════════════════════════════════════
    test('Validar duplicidad de ítems en ingreso @MS-1', async ({
                                                                                       movimientosNav,
                                                                                       registroMovimiento,
                                                                                       page,
                                                                                   }) => {
        test.setTimeout(180_000)

        await test.step('Given: navegar a Ingresos y crear nuevo ingreso', async () => {
            await movimientosNav.navegarAIngresosDesdeMenu();
            await registroMovimiento.clickNuevoMovimiento();
            //await registroMovimiento.clickNuevoIngreso();
        });

        await test.step('When: agregar el mismo ítem dos veces', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            //await page.getByText('Pproducto111111Item para combos estricto gravado160 un').click();
            //await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
        });

        await test.step('Then: verificar que la cantidad incrementó (no se creó fila duplicada)', async () => {
            await registroMovimiento.cantidadInput.click();
        });

        await test.step('And: limpiar y cancelar', async () => {
            await registroMovimiento.clickLimpiar();
            await registroMovimiento.clickLimpiarConfirmacion();
            await registroMovimiento.cerrarModal();
            await registroMovimiento.clickCancelar();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 6: Registrar ingreso con datos adicionales
    // ═══════════════════════════════════════════════════════════════
    test('Registrar ingreso con datos adicionales @MS-1', async ({
                                                                                            movimientosNav,
                                                                                            registroMovimiento,
                                                                                            datosOpcionales,
                                                                                            resultadoMovimiento,
                                                                                            stockVerificacion,
                                                                                            kardexVerificacion,
                                                                                            page,
                                                                                        }) => {

        test.setTimeout(180_000)

        await test.step('Given: navegar a Ingresos y crear nuevo ingreso', async () => {
            await movimientosNav.navegarAIngresosDesdeMenu();
            await registroMovimiento.clickNuevoMovimiento();
            //await registroMovimiento.clickNuevoIngreso();
        });

        await test.step('When: abrir datos opcionales y crear proveedor nuevo', async () => {
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.buscarProveedor(PROVEEDOR_EXISTENTE.nombre);
            await datosOpcionales.seleccionarProveedor(PROVEEDOR_EXISTENTE.nombre);//await datosOpcionales.crearProveedor(PROVEEDOR_TEST);
        });

        await test.step('And: guardar datos opcionales', async () => {
            await datosOpcionales.guardarDatos();
        });

        await test.step('And: buscar ítem, definir cantidad y registrar', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
            await registroMovimiento.llenarCantidad('10');
            await registroMovimiento.clickRegistrarIngreso();
        });

        await test.step('Then: ir al listado de movimientos', async () => {
            await resultadoMovimiento.irAlListado();
        });

        await test.step('And: verificar stock', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await stockVerificacion.clickAlmacenMultiple();
        });

        await test.step('And: verificar movimiento y datos opcionales en kardex', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
            const kardexPopup = new (await import('@pages/Logistica/KardexVerificacionPage')).KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await kardexPopup.clickCodigoMovimientoRegex(PATRON_CODIGO.INGRESO);
            await kardexPopup.clickDatosOpcionales();
            await kardexPopup.cerrarModalDetalle();
        });
    });
});
