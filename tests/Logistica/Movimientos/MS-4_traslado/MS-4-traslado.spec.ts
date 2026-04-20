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

test.describe('MS-4 | Traslados de Almacén @traslado', {tag: ['@logistica', '@movimientos']}, () => {

    // ═══════════════════════════════════════════════════════════════
    // Scenario 18: Registrar traslado correctamente
    // ═══════════════════════════════════════════════════════════════
    test('Registrar traslado correctamente @MS-4', async ({
                                                              movimientosNav,
                                                              registroMovimiento,
                                                              resultadoMovimiento,
                                                              stockVerificacion,
                                                              page,
                                                          }) => {
        test.setTimeout(180_000);

        await test.step('Given: navegar a Traslados', async () => {
            await movimientosNav.navegarATraslados();
        });

        await test.step('When: crear nuevo traslado con almacenes origen y destino distintos', async () => {
            await registroMovimiento.clickAgregarTraslado();
        });

        await test.step('And: buscar producto, definir cantidad y registrar', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_GRAVADO.nombre);
            await registroMovimiento.llenarCantidad('100');
            await registroMovimiento.clickRegistrarTraslado();
        });

        await test.step('Then: ir al listado de movimientos', async () => {
            await resultadoMovimiento.irAlListado();
        });

        await test.step('And: verificar stock', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo) //ultimo cambio xs codigo en traslado
            await stockVerificacion.clickVariosTexto();
        });

        await test.step('And: verificar movimiento en kardex', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await expect(kardexPage.getByText(PATRON_CODIGO.TRASLADO).first()).toBeVisible();
            await kardexPopup.clickCodigoMovimientoRegex(PATRON_CODIGO.TRASLADO)
            await kardexPopup.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 19: Validar traslado con mismo almacén
    // ═══════════════════════════════════════════════════════════════
    test('Validar traslado con mismo almacén @MS-4', async ({
                                                                movimientosNav,
                                                                registroMovimiento,
                                                                page,
                                                            }) => {
        test.setTimeout(180_000);

        await test.step('Given: navegar a Traslados', async () => {
            await movimientosNav.navegarATraslados();
        });

        await test.step('When: crear traslado seleccionando mismo almacén', async () => {
            await registroMovimiento.clickAgregarTraslado();
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

    // ═══════════════════════════════════════════════════════════════
    // Scenario 20: Registrar traslado con variante
    // ═══════════════════════════════════════════════════════════════
    test('Registrar traslado con variante @MS-4', async ({
                                                             movimientosNav,
                                                             registroMovimiento,
                                                             resultadoMovimiento,
                                                             stockVerificacion,
                                                             page,
                                                         }) => {
        test.setTimeout(180_000);

        await test.step('Given: navegar a Traslados', async () => {
            await movimientosNav.navegarATraslados();
            await registroMovimiento.clickAgregarTraslado();
        });

        await test.step('When: buscar variante, definir cantidad y motivo', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.VARIANTE_FLEXIBLE.nombre);
            await registroMovimiento.seleccionarVariante(VARIANTES.V1_FLEXIBLE.nombre);
            await registroMovimiento.llenarCantidad('05');
            await page.locator('div').filter({hasText: /^TRASLADO INTERNO$/}).nth(3).click();
            await page.getByText(MOTIVOS_TRASLADO.OTROS).click();
        });

        await test.step('And: registrar traslado', async () => {
            await registroMovimiento.clickRegistrarTraslado();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Then: verificar stock de la variante', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
        });

        await test.step('And: verificar kardex', async () => {
            const kardexPage = await stockVerificacion.abrirKardexVariante('313131-V001 Variante 1');
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await expect(kardexPage.getByText(PATRON_CODIGO.TRASLADO).first()).toBeVisible();
            await kardexPopup.clickCodigoMovimientoRegex(PATRON_CODIGO.TRASLADO)
            await kardexPopup.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 21: Registrar traslado con datos adicionales
    // ═══════════════════════════════════════════════════════════════
    test('Registrar traslado con datos adicionales @MS-4', async ({
                                                                      movimientosNav,
                                                                      registroMovimiento,
                                                                      datosOpcionales,
                                                                      resultadoMovimiento,
                                                                      stockVerificacion,
                                                                      page,
                                                                  }) => {
        test.setTimeout(180_000);

        await test.step('Given: navegar a Traslados y crear nuevo', async () => {
            await movimientosNav.navegarATraslados();
            await registroMovimiento.clickAgregarTraslado();
        });

        await test.step('When: buscar ítem', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await page.getByText('Pproducto121212item para').click();
        });

        await test.step('And: configurar datos opcionales', async () => {
            await datosOpcionales.abrirDatosOpcionales();
            await datosOpcionales.buscarProveedor(PROVEEDOR_EXISTENTE.numDocumento);
            await datosOpcionales.seleccionarProveedor(PROVEEDOR_EXISTENTE.nombre);

            // Campo texto ya creado por datos-adicionales.setup.ts
            await datosOpcionales.crearCampoTexto('nombre de traslado');
            await datosOpcionales.llenarCampoTexto(0, 'auto-traslado');
            await datosOpcionales.guardarDatos();
        });

        await test.step('And: registrar traslado', async () => {
            await registroMovimiento.clickRegistrarTraslado();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Then: verificar stock', async () => {
            await movimientosNav.navegarAStockProductos();
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
        });

        await test.step('And: verificar kardex y datos opcionales', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPage.waitForLoadState('networkidle');
            await kardexPopup.abrirVerDetallePorAlmacen2(ALMACENES.AUTO);
            await expect(kardexPage.getByText(PATRON_CODIGO.TRASLADO).first()).toBeVisible();
            await kardexPopup.clickCodigoMovimientoRegex(PATRON_CODIGO.TRASLADO)
            await kardexPopup.clickDatosOpcionalesDiv()
            await kardexPopup.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 22: Registrar traslado por confirmar + configuración
    // ═══════════════════════════════════════════════════════════════
    test('Registrar traslado por confirmar + configuración @MS-4', async ({
                                                                              movimientosNav,
                                                                              registroMovimiento,
                                                                              resultadoMovimiento,
                                                                              listadoMovimientos,
                                                                              page,
                                                                          }) => {
        test.setTimeout(180_000);

        await test.step('Given: activar preferencia avanzada de traslado por confirmar', async () => {
            await movimientosNav.navegarAConfiguracionSucursales();
            await page.locator('[id="cfg_cmp-menu-configuracion.v-button:menu-2-4"]').click();
            await page.getByText('Preferencias avanzadas').nth(2).click();
            await page.locator('.cmp-items-preferencias-avanzadas > div:nth-child(4) > .icon').click();
            await page.locator('div:nth-child(4) > .switch.flex-row > .v-switch > .switch-content > .switch > .slider').click();
            await page.getByRole('button', {name: 'Guardar'}).click();
            await page.locator('.v-modal > div').first().click();
        });

        await test.step('When: registrar traslado', async () => {
            await movimientosNav.navegarATraslados();
            await registroMovimiento.clickAgregarTraslado();
            await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_GRAVADO.nombre);
            await registroMovimiento.clickRegistrarTraslado();
            await resultadoMovimiento.irAlListado();
        });

        await test.step('Then: verificar bitácora de creación', async () => {
            await listadoMovimientos.abrirMenuAcciones();
            await listadoMovimientos.clickVerBitacora();
            await listadoMovimientos.clickEventoBitacora('Creación');
            await page.getByText('Todos').first().click();
            await listadoMovimientos.cerrarBitacora();
        });
    });
});
