import {test} from '@fixtures/Logistica/movimientos-fixture';
import {
    ALMACENES,
    ITEMS_TEST,
    MOTIVOS_AJUSTE,
    PATRON_CODIGO,
    PROVEEDOR_EXISTENTE,
} from '@helpers/Logistica/movimiento-data.helper';
import {
    buscarYSeleccionarItem,
    configurarDatosOpcionalesEstandar,
    crearAjusteConItem,
    definirCantidadYFactor,
    registrarAjusteEIrAlListado,
    verificarStockYKardex
} from '@helpers/Logistica/verificaciones-movimientos.helper';

test.describe('MS-3 | Ajustes de Almacén @ajuste', {tag: ['@logistica', '@movimientos']}, () => {

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
            ITEMS_TEST.PRODUCTO_ESTRICTO.nombre
        );
        await definirCantidadYFactor(registroMovimiento, '500', 'Agregar');
        await registrarAjusteEIrAlListado(registroMovimiento, resultadoMovimiento);
        await verificarStockYKardex(
            movimientosNav, stockVerificacion, kardexVerificacion, page,
            ITEMS_TEST.PRODUCTO_ESTRICTO.codigo, ALMACENES.AUTO, PATRON_CODIGO.AJUSTE
        );
    });

    test('Registrar ajuste con insumo @MS-3', async ({
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
            ITEMS_TEST.INSUMO_TEST1.codigo,
            ITEMS_TEST.INSUMO_TEST1.nombre
        );
        await definirCantidadYFactor(registroMovimiento, '500', 'Agregar');
        await registrarAjusteEIrAlListado(registroMovimiento, resultadoMovimiento);
        await verificarStockYKardex(
            movimientosNav, stockVerificacion, kardexVerificacion, page,
            ITEMS_TEST.INSUMO_TEST1.codigo, ALMACENES.AUTO, PATRON_CODIGO.AJUSTE
        );
    });

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
        await crearAjusteConItem(registroMovimiento,
            ITEMS_TEST.EQUIVALENTE_EST.codigo,
            ITEMS_TEST.EQUIVALENTE_EST.nombre,
            page,
            'item equivalente estricto gravadoFactor Multiplicador:1S/'
        );
        await definirCantidadYFactor(registroMovimiento, '10', 'Agregar');
        await registrarAjusteEIrAlListado(registroMovimiento, resultadoMovimiento);
        await verificarStockYKardex(
            movimientosNav, stockVerificacion, kardexVerificacion, page,
            ITEMS_TEST.EQUIVALENTE_EST.codigo, ALMACENES.AUTO, PATRON_CODIGO.AJUSTE, 'item equivalente estricto'
        );
    });

    test('Registrar ajuste tipo Quitar @MS-3', async ({
                                                          movimientosNav,
                                                          registroMovimiento,
                                                          resultadoMovimiento,
                                                          stockVerificacion,
                                                          kardexVerificacion,
                                                          page,
                                                      }) => {
        await test.step('Given: navegar a Ajustes', async () => {
            await movimientosNav.navegarAAjustesDesdeMenu();
        });
        await crearAjusteConItem(registroMovimiento,
            ITEMS_TEST.PRODUCTO_ESTRICTO.codigo,
            ITEMS_TEST.PRODUCTO_ESTRICTO.nombre
        );
        await definirCantidadYFactor(registroMovimiento, '400', 'Quitar');
        await registrarAjusteEIrAlListado(registroMovimiento, resultadoMovimiento);
        await verificarStockYKardex(
            movimientosNav, stockVerificacion, kardexVerificacion, page,
            ITEMS_TEST.PRODUCTO_ESTRICTO.codigo, ALMACENES.AUTO, PATRON_CODIGO.AJUSTE
        );
    });

    test('Registrar ajuste con datos adicionales @MS-3', async ({
                                                                    movimientosNav,
                                                                    registroMovimiento,
                                                                    datosOpcionales,
                                                                    resultadoMovimiento,
                                                                    stockVerificacion,
                                                                    kardexVerificacion,
                                                                    page,
                                                                }) => {
        await test.step('Given: navegar a Ajustes con almacén y motivo específicos', async () => {
            await movimientosNav.navegarAAjustes();
            await registroMovimiento.clickNuevoMovimiento();
            await registroMovimiento.seleccionarAlmacenNth(ALMACENES.AUTO, ALMACENES.VENTAS, 3);
            await page.getByText(MOTIVOS_AJUSTE.ACTUALIZACION).first().click();
            await page.getByText(MOTIVOS_AJUSTE.VENCIMIENTO).click();
        });
        await buscarYSeleccionarItem(registroMovimiento,
            ITEMS_TEST.PRODUCTO_ESTRICTO.codigo,
            ITEMS_TEST.PRODUCTO_ESTRICTO.nombre
        );
        await configurarDatosOpcionalesEstandar(
            datosOpcionales,
            PROVEEDOR_EXISTENTE.numDocumento,
            PROVEEDOR_EXISTENTE.nombre
        );
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
