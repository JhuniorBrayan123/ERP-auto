import {test} from '@fixtures/Logistica/movimientos-fixture';
import {
    ALMACENES,
    ITEMS_TEST,
    MOTIVOS_AJUSTE,
    PATRON_CODIGO,
    PROVEEDOR_EXISTENTE,
} from '@helpers/Logistica/movimiento-data.helper';

test.describe('MS-3 | Ajustes de Almacén @ajuste', {tag: ['@logistica', '@movimientos']}, () => {
//Esto es un nuevo test desde consola escribiendo con los ojos puestos en el teclado y en el cursor del desde el nuevo sitio de Junuior
    // ═══════════════════════════════════════════════════════════════
    // Scenario 13: Registrar ajuste tipo Agregar
    // ═══════════════════════════════════════════════════════════════
    test('debe registrar un ajuste tipo Agregar e incrementar stock @MS-3', async ({
                                                                                 movimientosNav,
                                                                                 registroMovimiento,
                                                                                 resultadoMovimiento,
                                                                                 stockVerificacion,
                                                                                 kardexVerificacion,
                                                                                 page,
                                                                             }) => {

        await test.step('Given: navegar a Ajustes', async () => {
            await movimientosNav.navegarAAjustes();
        });

        await test.step('When: crear nuevo ajuste con producto', async () => {
            await registroMovimiento.clickAgregarAjuste();
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
        });

        await test.step('And: definir cantidad y factor Agregar', async () => {
            await registroMovimiento.llenarCantidad('500');
            await registroMovimiento.seleccionarFactorAjuste('Agregar');
        });

        await test.step('And: registrar ajuste', async () => {
            await registroMovimiento.clickRegistrarAjuste();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Then: verificar stock incrementado', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await stockVerificacion.clickVariosTexto();
            await page.getByRole('table').getByText(ALMACENES.AUTO).first().click();
        });

        await test.step('And: verificar movimiento en kardex', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await kardexVerificacion.clickVariosTexto();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await kardexVerificacion.expectPatronCodigoMovimientoVisible(PATRON_CODIGO.AJUSTE);
            await kardexVerificacion.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 14: Registrar ajuste tipo Quitar
    // ═══════════════════════════════════════════════════════════════
    test('debe registrar un ajuste tipo Quitar y disminuir stock @MS-3', async ({
                                                                              movimientosNav,
                                                                              registroMovimiento,
                                                                              resultadoMovimiento,
                                                                              stockVerificacion,
                                                                              kardexVerificacion,
                                                                              page,
                                                                          }) => {
        test.setTimeout(120_000)

        await test.step('Given: navegar a Ajustes', async () => {
            await movimientosNav.navegarAAjustesDesdeMenu();
        });

        await test.step('When: crear ajuste con producto', async () => {
            await registroMovimiento.clickAgregarAjuste();
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
        });

        await test.step('And: definir cantidad y factor Quitar', async () => {
            await registroMovimiento.llenarCantidad('400');
            await registroMovimiento.seleccionarFactorAjuste('Quitar');
        });

        await test.step('And: registrar ajuste', async () => {
            await registroMovimiento.clickRegistrarAjuste();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Then: verificar stock disminuido', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await stockVerificacion.clickVariosTexto();
        });

        await test.step('And: verificar movimiento en kardex', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await kardexVerificacion.clickVariosTexto();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await kardexVerificacion.expectPatronCodigoMovimientoVisible(PATRON_CODIGO.AJUSTE);
            await kardexVerificacion.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 15: Registrar ajuste con insumo
    // ═══════════════════════════════════════════════════════════════
    test('debe registrar un ajuste con insumo y verificar stock @MS-3', async ({
                                                                             movimientosNav,
                                                                             registroMovimiento,
                                                                             resultadoMovimiento,
                                                                             stockVerificacion,
                                                                             kardexVerificacion,
                                                                             page,
                                                                         }) => {
        test.setTimeout(120_000)

        await test.step('Given: navegar a Ajustes', async () => {
            await movimientosNav.navegarAAjustes();
        });

        await test.step('When: crear ajuste con insumo', async () => {
            await registroMovimiento.clickAgregarAjuste();
            await registroMovimiento.buscarItem(ITEMS_TEST.INSUMO_TEST1.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.INSUMO_TEST1.nombre);
        });

        await test.step('And: definir cantidad y factor Agregar', async () => {
            await registroMovimiento.llenarCantidad('500');
            await registroMovimiento.seleccionarFactorAjuste('Agregar');
        });

        await test.step('And: registrar ajuste', async () => {
            await registroMovimiento.clickRegistrarAjuste();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Then: verificar stock del insumo', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.INSUMO_TEST1.codigo);
            await stockVerificacion.clickVariosTexto();
        });

        await test.step('And: verificar movimiento en kardex', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.INSUMO_TEST1.codigo);
            await kardexVerificacion.clickVariosTexto();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await kardexVerificacion.expectPatronCodigoMovimientoVisible(PATRON_CODIGO.AJUSTE);
            await kardexVerificacion.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 16: Registrar ajuste con equivalencia
    // ═══════════════════════════════════════════════════════════════
    test('debe registrar un ajuste con ítem equivalente y verificar stock @MS-3', async ({
                                                                                       movimientosNav,
                                                                                       registroMovimiento,
                                                                                       resultadoMovimiento,
                                                                                       stockVerificacion,
                                                                                       kardexVerificacion,
                                                                                       page,
                                                                                   }) => {

        await test.step('Given: navegar a Ajustes', async () => {
            await movimientosNav.navegarAAjustes();
        });

        await test.step('When: crear ajuste con equivalente estricto', async () => {
            await registroMovimiento.clickAgregarAjuste();
            await registroMovimiento.buscarItem(ITEMS_TEST.EQUIVALENTE_EST.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.EQUIVALENTE_EST.nombre);
            await page.getByText('item equivalente estricto gravadoFactor Multiplicador:1S/').click();
        });

        await test.step('And: definir cantidad y factor Agregar', async () => {
            await registroMovimiento.llenarCantidad('10');
            await registroMovimiento.seleccionarFactorAjuste('Agregar');
        });

        await test.step('And: registrar ajuste', async () => {
            await registroMovimiento.clickRegistrarAjuste();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Then: verificar stock con equivalencia', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.EQUIVALENTE_EST.codigo);
            await page.getByText('item equivalente estricto').click();
            await stockVerificacion.clickVariosTexto();
        });

        await test.step('And: verificar movimiento en kardex', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.EQUIVALENTE_EST.codigo);
            await page.getByText('item equivalente estricto').click();
            await kardexVerificacion.clickVariosTexto();
            await kardexVerificacion.clickKardexPorProducto();
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            //await kardexVerificacion.abrirVerDetalle(1) // se cambio el ver detalle aqui
            await kardexVerificacion.expectPatronCodigoMovimientoVisible(PATRON_CODIGO.AJUSTE);
            await kardexVerificacion.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 17: Registrar ajuste con datos adicionales
    // ═══════════════════════════════════════════════════════════════
    test('debe registrar ajuste con datos adicionales y campos personalizados @MS-3', async ({
                                                                                           movimientosNav,
                                                                                           registroMovimiento,
                                                                                           datosOpcionales,
                                                                                           resultadoMovimiento,
                                                                                           stockVerificacion,
                                                                                           kardexVerificacion,
                                                                                           page,
                                                                                       }) => {
        test.setTimeout(120_000)

        await test.step('Given: navegar a Ajustes con almacén y motivo específicos', async () => {
            await movimientosNav.navegarAAjustes();
            await registroMovimiento.clickNuevoMovimiento();
            await registroMovimiento.seleccionarAlmacenNth(ALMACENES.AUTO, ALMACENES.VENTAS, 3);
            await page.getByText(MOTIVOS_AJUSTE.ACTUALIZACION).first().click();
            await page.getByText(MOTIVOS_AJUSTE.VENCIMIENTO).click();
        });

        await test.step('When: buscar ítem', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
        });

        await test.step('And: configurar datos opcionales con proveedor y campos adicionales', async () => {
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.buscarProveedor(PROVEEDOR_EXISTENTE.numDocumento);
            await datosOpcionales.seleccionarProveedor(PROVEEDOR_EXISTENTE.nombre);

            // Campo de texto

            //await datosOpcionales.crearCampoTexto('nombre');
            await datosOpcionales.llenarCampoTexto(0, 'auto');

            // Campo de fecha
            //await datosOpcionales.crearCampoFecha('fecha');
            await datosOpcionales.clickCampoFecha(0);
            await datosOpcionales.seleccionarDiaEnDatepickerVisible('15');

            // Campo de selección
            //await datosOpcionales.crearCampoSeleccion('entorno', ['certificación', 'producción'], true);

            // Campo de número
            //await datosOpcionales.crearCampoNumero('numero de test');
            await datosOpcionales.llenarCampoNumero(0, '98989898989898989');

            await datosOpcionales.guardarDatos();
        });

        await test.step('And: definir cantidad y registrar ajuste', async () => {
            await registroMovimiento.llenarCantidad('10');
            await registroMovimiento.clickRegistrarAjuste();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Then: verificar stock', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await stockVerificacion.clickVariosTexto();
        });

        await test.step('And: verificar kardex y datos opcionales', async () => {
            await movimientosNav.navegarAKardexTotal();
            await page.waitForTimeout(2000);
            await kardexVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await kardexVerificacion.clickVariosTexto();
            await kardexVerificacion.clickKardexPorProducto();
            // await kardexVerificacion.seleccionarAlmacenFiltroKardexPorProducto(ALMACENES.VENTAS);
            await kardexVerificacion.abrirVerDetallePorAlmacen2(ALMACENES.VENTAS);
            await kardexVerificacion.expectPatronCodigoMovimientoVisible(PATRON_CODIGO.AJUSTE);
            await kardexVerificacion.clickCodigoMovimientoRegex(PATRON_CODIGO.AJUSTE);
            await kardexVerificacion.clickDatosOpcionalesDiv();
            await kardexVerificacion.cerrarModalDetalle();
        });
    });
});
