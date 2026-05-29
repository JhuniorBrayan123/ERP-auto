import {expect, test} from '@fixtures/Logistica/movimientos-fixture';
import {
    ALMACENES,
    ITEMS_TEST,
    MOTIVOS_TRASLADO,
    PATRON_CODIGO,
    PROVEEDOR_EXISTENTE,
    VARIANTES,
} from '@helpers/Logistica/movimiento-data.helper';
import {KardexVerificacionPage} from '@pages/Logistica/KardexVerificacionPage';
import {
    buscarYSeleccionarItem,
    navegarATrasladosYNuevo,
    registrarTrasladoEIrAlListado,
    verificarBitacoraEdicion,
    verificarKardexDesdeStock,
    verificarStockPorCodigoYClick,
} from '@helpers/Logistica/verificaciones-movimientos.helper';
import {SucursalesPage} from "@pages/Logistica/SucursalesPage";

test.describe('MS-4 | Traslados de Almacén @traslado', {tag: ['@logistica', '@movimientos']}, () => {

    test('Registrar traslado correctamente @MS-4', async ({
                                                              movimientosNav,
                                                              registroMovimiento,
                                                              resultadoMovimiento,
                                                              stockVerificacion,
                                                          }) => {
        test.setTimeout(180_000);

        await navegarATrasladosYNuevo(movimientosNav, registroMovimiento);

        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.PRODUCTO_GRAVADO.codigo, ITEMS_TEST.PRODUCTO_GRAVADO.nombre);

        await test.step('When: definir cantidad', async () => {
            await registroMovimiento.llenarCantidad('100');
        });

        await registrarTrasladoEIrAlListado(registroMovimiento, resultadoMovimiento);

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.PRODUCTO_GRAVADO.codigo);

        await verificarKardexDesdeStock(stockVerificacion, ALMACENES.AUTO, PATRON_CODIGO.TRASLADO, true);
    });

    test('Validar traslado con mismo almacén @MS-4', async ({
                                                                movimientosNav,
                                                                registroMovimiento,
                                                                page,
                                                            }) => {
        test.setTimeout(180_000);

        await navegarATrasladosYNuevo(movimientosNav, registroMovimiento);

        await test.step('When: crear traslado seleccionando mismo almacén', async () => {
            await page.locator('div').filter({hasText: /^ALMACEN-AUTO$/}).nth(3).click();
            await page.getByText(ALMACENES.VENTAS).first().click();
        });

        await test.step('Then: debe mostrar mensaje de error', async () => {
            await expect(page.getByText('Almacén destino debe ser')).toBeVisible();
        });

        await test.step('And: verificar que no permite registrar', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_ESTRICTO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_ESTRICTO.nombre);
            await registroMovimiento.clickRegistrarTraslado();
        });
    });

    test('Registrar traslado con variante @MS-4', async ({
                                                             movimientosNav,
                                                             registroMovimiento,
                                                             resultadoMovimiento,
                                                             stockVerificacion,
                                                             page,
                                                         }) => {
        test.setTimeout(180_000);

        await navegarATrasladosYNuevo(movimientosNav, registroMovimiento);

        await test.step('When: buscar variante, definir cantidad y motivo', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.VARIANTE_FLEXIBLE.nombre);
            await registroMovimiento.seleccionarVariante(VARIANTES.V1_FLEXIBLE.nombre);
            await registroMovimiento.llenarCantidad('05');
            await page.locator('div').filter({hasText: /^TRASLADO INTERNO$/}).nth(3).click();
            await page.getByText(MOTIVOS_TRASLADO.OTROS).click();
        });

        await registrarTrasladoEIrAlListado(registroMovimiento, resultadoMovimiento);

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.VARIANTE_FLEXIBLE.codigo, async () => {
            
        });

        await test.step('And: verificar kardex', async () => {
            const kardexPage = await stockVerificacion.abrirKardexVariante(VARIANTES.V1_FLEXIBLE.codigo);
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await expect(kardexPage.getByText(PATRON_CODIGO.TRASLADO).first()).toBeVisible();
            await kardexPopup.clickCodigoMovimientoRegex(PATRON_CODIGO.TRASLADO)
            await kardexPopup.cerrarModalDetalle();
        });
    });

    test('Registrar traslado con datos adicionales @MS-4', async ({
                                                                      movimientosNav,
                                                                      registroMovimiento,
                                                                      datosOpcionales,
                                                                      resultadoMovimiento,
                                                                      stockVerificacion,
                                                                      page,
                                                                  }) => {

        await navegarATrasladosYNuevo(movimientosNav, registroMovimiento);

        await test.step('When: buscar ítem', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_GRAVADO.nombre);
        });
        await test.step('And: configurar datos opcionales', async () => {
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.buscarProveedor(PROVEEDOR_EXISTENTE.numDocumento);
            await datosOpcionales.seleccionarProveedor(PROVEEDOR_EXISTENTE.nombre);

            await datosOpcionales.crearCampoTexto('nombre de traslado');
            await datosOpcionales.llenarCampoTexto(0, 'auto-traslado');
            await datosOpcionales.guardarDatos();
        });

        await registrarTrasladoEIrAlListado(registroMovimiento, resultadoMovimiento);

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.PRODUCTO_GRAVADO.codigo, async () => {
            
        });

        await test.step('And: verificar kardex y datos opcionales', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await expect(kardexPage.getByText(PATRON_CODIGO.TRASLADO).first()).toBeVisible();
            await kardexPopup.clickCodigoMovimientoRegex(PATRON_CODIGO.TRASLADO)
            await kardexPopup.clickDatosOpcionalesDiv()
            await kardexPopup.cerrarModalDetalle();
        });
    });

    test('Registrar traslado por confirmar + configuración @MS-4', async ({
                                                                              movimientosNav,
                                                                              registroMovimiento,
                                                                              resultadoMovimiento,
                                                                              listadoMovimientos,

                                                                              page,
                                                                          }) => {
        const sucursalesPage = new SucursalesPage(page);

        await test.step('Given: activar preferencia avanzada de traslado por confirmar', async () => {
            await movimientosNav.navegarAConfiguracionSucursales();
            await sucursalesPage.activarPreferenciaTraslado()

        });

        await test.step('When: registrar traslado', async () => {
            await movimientosNav.navegarATraslados();
            await registroMovimiento.clickAgregarTraslado();
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_GRAVADO.nombre);
        });

        await registrarTrasladoEIrAlListado(registroMovimiento, resultadoMovimiento);

        await verificarBitacoraEdicion(listadoMovimientos, ['Creación']);
    });
});
