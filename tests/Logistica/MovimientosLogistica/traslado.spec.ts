import {expect, test} from '../../../src/fixtures/Logistica/movimientos-fixture';
import {
    ALMACENES,
    ITEMS_TEST,
    MOTIVOS_TRASLADO,
    PATRON_CODIGO,
    PROVEEDOR_EXISTENTE,
    VARIANTES,
} from '../../../src/helpers/Logistica/movimiento-data.helper';
import {KardexVerificacionPage} from '../../../src/pages/Logistica/KardexVerificacionPage';

test.describe('Traslados de Almacén @traslado', {tag: ['@logistica', '@movimientos']}, () => {

    // ═══════════════════════════════════════════════════════════════
    // Scenario 18: Registrar traslado correctamente
    // ═══════════════════════════════════════════════════════════════
    test('debe registrar un traslado entre almacenes y verificar stock y kardex', async ({
                                                                                             movimientosNav,
                                                                                             registroMovimiento,
                                                                                             resultadoMovimiento,
                                                                                             stockVerificacion,
                                                                                             page,
                                                                                         }) => {

        await test.step('Given: navegar a Traslados', async () => {
            await movimientosNav.navegarATraslados();
        });

        await test.step('When: crear nuevo traslado con almacenes origen y destino distintos', async () => {
            await registroMovimiento.clickAgregarTraslado();
            //await registroMovimiento.seleccionarAlmacenesTraslado1(ALMACENES.AUTO, ALMACENES.AUTO, ALMACENES.VENTAS, ALMACENES.VENTAS);
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
            //await page.locator('.module.module-205').click();
            //await page.getByRole('textbox', {name: 'Buscar por nombre, código o c'}).click();
            //await page.getByRole('textbox', {name: 'Buscar por nombre, código o c'}).fill(ITEMS_TEST.PRODUCTO_GRAVADO.codigo); Anterior
            await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo)
            // await page.getByRole('cell', {name: 'Varios*'}).click();
            await stockVerificacion.clickVariosTexto();
        });

        await test.step('And: verificar movimiento en kardex', async () => {
            const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
            const kardexPopup = new KardexVerificacionPage(kardexPage);
            await kardexPopup.abrirVerDetalle(0);
            await expect(kardexPage.getByText(PATRON_CODIGO.TRASLADO).first()).toBeVisible();
            await kardexPopup.esperarSinOverload();
            await kardexPage.getByText(PATRON_CODIGO.TRASLADO).first().click();
            await kardexPopup.esperarSinOverload();
            await kardexPopup.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 19: Validar traslado con mismo almacén
    // ═══════════════════════════════════════════════════════════════
    test('debe bloquear traslado cuando origen y destino son el mismo almacén', async ({
                                                                                           movimientosNav,
                                                                                           registroMovimiento,
                                                                                           page,
                                                                                       }) => {

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
    test('debe registrar traslado con variante y verificar stock', async ({
                                                                              movimientosNav,
                                                                              registroMovimiento,
                                                                              resultadoMovimiento,
                                                                              stockVerificacion,
                                                                              page,
                                                                          }) => {

        await test.step('Given: navegar a Traslados', async () => {
            await movimientosNav.navegarATraslados();
            await registroMovimiento.clickAgregarTraslado();
        });

        await test.step('When: buscar variante, definir cantidad y motivo', async () => {
            await registroMovimiento.buscarItem(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
            await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.VARIANTE_FLEXIBLE.nombre);
            await registroMovimiento.seleccionarVariante(VARIANTES.V1_FLEXIBLE);
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
            await kardexPopup.abrirVerDetalle(0);
            await expect(kardexPage.getByText(PATRON_CODIGO.TRASLADO).first()).toBeVisible();
            await kardexPopup.esperarSinOverload();
            await kardexPage.getByText(PATRON_CODIGO.TRASLADO).first().click();
            await kardexPopup.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 21: Registrar traslado con datos adicionales
    // ═══════════════════════════════════════════════════════════════
    test('debe registrar traslado con datos adicionales', async ({
                                                                     movimientosNav,
                                                                     registroMovimiento,
                                                                     datosOpcionales,
                                                                     resultadoMovimiento,
                                                                     stockVerificacion,
                                                                     page,
                                                                 }) => {

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

            // Campo adicional texto
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
            await kardexPopup.abrirVerDetalle(0);
            await expect(kardexPage.getByText(PATRON_CODIGO.TRASLADO).first()).toBeVisible();
            await kardexPopup.esperarSinOverload();
            //await kardexVerificacion.clickCodigoMovimientoRegex(PATRON_CODIGO.AJUSTE);
            await kardexPage.getByText(PATRON_CODIGO.TRASLADO).first().click();
            await kardexPopup.clickDatosOpcionalesDiv();
            await kardexPopup.expectDatosOpcionalesVisible();
            await kardexPopup.cerrarModalDetalle();
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // Scenario 22: Registrar traslado por confirmar + configuración
    // ═══════════════════════════════════════════════════════════════
    test('debe registrar traslado por confirmar con preferencia avanzada', async ({
                                                                                      movimientosNav,
                                                                                      registroMovimiento,
                                                                                      resultadoMovimiento,
                                                                                      listadoMovimientos,
                                                                                      page,
                                                                                  }) => {

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
