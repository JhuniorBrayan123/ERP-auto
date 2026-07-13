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

test.describe('MS-04 | Traslados de Almacén', {tag: ['@logistica', '@movimientos']}, () => {

    test('SC-01: Registrar traslado correctamente @MS-04.1', async ({
                                                              movimientosNav,
                                                              registroMovimiento,
                                                              resultadoMovimiento,
                                                              stockVerificacion,
                                                          }) => {
        test.setTimeout(180_000);

        await navegarATrasladosYNuevo(movimientosNav, registroMovimiento);

        await buscarYSeleccionarItem(registroMovimiento, ITEMS_TEST.ESTRICTO_GRAVADO_7.codigo, ITEMS_TEST.ESTRICTO_GRAVADO_7.nombre);

        await test.step('When: definir cantidad', async () => {
            await registroMovimiento.llenarCantidad('100');
        });

        await registrarTrasladoEIrAlListado(registroMovimiento, resultadoMovimiento);

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.ESTRICTO_GRAVADO_7.codigo);

        await verificarKardexDesdeStock(stockVerificacion, ALMACENES.AUTO, PATRON_CODIGO.TRASLADO, true);
    });

    test('SC-02: Validar traslado con mismo almacén @MS-04.2', async ({
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

    test('SC-03: Registrar traslado con variante @MS-04.3', async ({
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

    test('SC-04: Registrar traslado con datos adicionales @MS-04.4', async ({
                                                                      movimientosNav,
                                                                      registroMovimiento,
                                                                      datosOpcionales,
                                                                      resultadoMovimiento,
                                                                      stockVerificacion,
                                                                      page,
                                                                  }) => {

        await navegarATrasladosYNuevo(movimientosNav, registroMovimiento);

        await test.step('When: buscar ítem', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.ESTRICTO_GRAVADO_7.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.ESTRICTO_GRAVADO_7.nombre);
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

        await verificarStockPorCodigoYClick(movimientosNav, stockVerificacion, ITEMS_TEST.ESTRICTO_GRAVADO_7.codigo, async () => {
            
        });

        await test.step('And: verificar kardex y datos opcionales', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock(ITEMS_TEST.ESTRICTO_GRAVADO_7.codigo);
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await expect(kardexPage.getByText(PATRON_CODIGO.TRASLADO).first()).toBeVisible();
            await kardexPopup.clickCodigoMovimientoRegex(PATRON_CODIGO.TRASLADO)
            await kardexPopup.clickDatosOpcionalesDiv()
            await kardexPopup.cerrarModalDetalle();
        });
    });

    test('SC-05: Registrar traslado por confirmar + configuración @MS-04.5', async ({
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
            await registroMovimiento.buscarItem(ITEMS_TEST.ESTRICTO_GRAVADO_7.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.ESTRICTO_GRAVADO_7.nombre);
        });

        await registrarTrasladoEIrAlListado(registroMovimiento, resultadoMovimiento);

        await verificarBitacoraEdicion(listadoMovimientos, ['Creación']);
    });
});
