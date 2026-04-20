import {test} from '@fixtures/Logistica/movimientos-fixture';
import {
    ALMACENES,
    ITEMS_TEST,
    MOTIVOS_AJUSTE,
    PATRON_CODIGO,
    PROVEEDOR_EXISTENTE,
} from '@helpers/Logistica/movimiento-data.helper';
import {
    crearAjusteConItem,
    definirCantidadYFactor,
    registrarAjusteEIrAlListado,
    verificarStockYKardex
} from '@helpers/Logistica/verificaciones-movimientos.helper';

test.describe('MS-3 | Ajustes de Almacén @ajuste', {tag: ['@logistica', '@movimientos']}, () => {


//Esto es un nuevo test desde consola escribiendo con los ojos puestos en el teclado y en el cursor del desde el nuevo sitio de Junuior
    // ═══════════════════════════════════════════════════════════════
    // Scenario 13: Registrar ajuste tipo Agregar
    // ═══════════════════════════════════════════════════════════════
    test('Registrar ajuste tipo Agregar @MS-3', async ({
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
        await crearAjusteConItem(registroMovimiento,
            ITEMS_TEST.PRODUCTO_ESTRICTO.codigo,
            ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
        await definirCantidadYFactor(registroMovimiento, '500', 'Agregar')
        await registrarAjusteEIrAlListado(registroMovimiento, resultadoMovimiento);
        await verificarStockYKardex(
            movimientosNav, stockVerificacion, kardexVerificacion, page,
            ITEMS_TEST.PRODUCTO_ESTRICTO.codigo, ALMACENES.AUTO, PATRON_CODIGO.AJUSTE
        );
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 14: Registrar ajuste tipo Quitar
    // ═══════════════════════════════════════════════════════════════
    test('Registrar ajuste tipo Quitar @MS-3', async ({
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

        await crearAjusteConItem(registroMovimiento,
            ITEMS_TEST.PRODUCTO_ESTRICTO.codigo,
            ITEMS_TEST.PRODUCTO_ESTRICTO.nombre
        );
        await test.step('And: definir cantidad y factor Quitar', async () => {
            await registroMovimiento.llenarCantidad('400');
            await registroMovimiento.seleccionarFactorAjuste('Quitar');
        });
        await registrarAjusteEIrAlListado(registroMovimiento, resultadoMovimiento
        );
        await verificarStockYKardex(
            movimientosNav, stockVerificacion, kardexVerificacion, page,
            ITEMS_TEST.PRODUCTO_ESTRICTO.codigo, ALMACENES.AUTO, PATRON_CODIGO.AJUSTE
        );
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 15: Registrar ajuste con insumo
    // ═══════════════════════════════════════════════════════════════
    test('Registrar ajuste con insumo @MS-3', async ({
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
        await crearAjusteConItem(registroMovimiento,
            ITEMS_TEST.INSUMO_TEST1.codigo,
            ITEMS_TEST.INSUMO_TEST1.nombre,)

        await test.step('And: definir cantidad y factor Agregar', async () => {
            await registroMovimiento.llenarCantidad('500');
            await registroMovimiento.seleccionarFactorAjuste('Agregar');
        });
        await registrarAjusteEIrAlListado(registroMovimiento, resultadoMovimiento);
        await verificarStockYKardex(
            movimientosNav, stockVerificacion, kardexVerificacion, page,
            ITEMS_TEST.INSUMO_TEST1.codigo, ALMACENES.AUTO, PATRON_CODIGO.AJUSTE
        );
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 16: Registrar ajuste con equivalencia
    // ═══════════════════════════════════════════════════════════════
    test('Registrar ajuste con equivalencia @MS-3', async ({
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
        await registrarAjusteEIrAlListado(registroMovimiento, resultadoMovimiento);
        await verificarStockYKardex(
            movimientosNav, stockVerificacion, kardexVerificacion, page,
            ITEMS_TEST.EQUIVALENTE_EST.codigo, ALMACENES.AUTO, PATRON_CODIGO.AJUSTE, 'item equivalente estricto'
        );
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 17: Registrar ajuste con datos adicionales
    // ═══════════════════════════════════════════════════════════════
    test('Registrar ajuste con datos adicionales @MS-3', async ({
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
        await crearAjusteConItem(registroMovimiento,
            ITEMS_TEST.PRODUCTO_ESTRICTO.codigo,
            ITEMS_TEST.PRODUCTO_ESTRICTO.nombre)
        await test.step('And: configurar datos opcionales con proveedor y campos adicionales', async () => {
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.buscarProveedor(PROVEEDOR_EXISTENTE.numDocumento);
            await datosOpcionales.seleccionarProveedor(PROVEEDOR_EXISTENTE.nombre);
            // Campo de texto
            await datosOpcionales.llenarCampoTexto(0, 'auto');
            // Campo de fecha
            await datosOpcionales.clickCampoFecha(0);
            await datosOpcionales.seleccionarDiaEnDatepickerVisible('15');
            //Campo de número
            await datosOpcionales.llenarCampoNumero(0, '98989898989898989');
            await datosOpcionales.guardarDatos();
        });
        await test.step('And: definir cantidad y registrar ajuste', async () => {
            await registroMovimiento.llenarCantidad('10');
        });
        await registrarAjusteEIrAlListado(registroMovimiento, resultadoMovimiento);
        await verificarStockYKardex(
            movimientosNav, stockVerificacion, kardexVerificacion, page,
            ITEMS_TEST.PRODUCTO_ESTRICTO.codigo, ALMACENES.VENTAS, PATRON_CODIGO.AJUSTE
        );
    });
});
