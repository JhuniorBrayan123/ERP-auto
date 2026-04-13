import { test, expect } from '../../../src/fixtures/Logistica/movimientos-fixture';
import {
  ITEMS_TEST,
  ALMACENES,
  MOTIVOS_SALIDA,
  DATOS_CONTACTO,
  PROVEEDOR_EXISTENTE,
  PATRON_CODIGO,
  VARIANTES,
} from '../../../src/helpers/Logistica/movimiento-data.helper';
import { KardexVerificacionPage } from '../../../src/pages/Logistica/KardexVerificacionPage';
import { StockVerificacionPage } from '../../../src/pages/Logistica/StockVerificacionPage';
import { ListadoMovimientosPage } from '../../../src/pages/Logistica/ListadoMovimientosPage';
import { RegistroMovimientoPage } from '../../../src/pages/Logistica/RegistroMovimientoPage';

test.describe('Salidas de Almacén @salida', { tag: ['@logistica', '@movimientos'] }, () => {

  // ═══════════════════════════════════════════════════════════════
  // Scenario 7: Registrar salida correctamente y reflejar disminución de stock
  // ═══════════════════════════════════════════════════════════════
  test('debe registrar una salida con producto y verificar disminución de stock y kardex', async ({
    movimientosNav,
    registroMovimiento,
    resultadoMovimiento,
    stockVerificacion,
    kardexVerificacion,
    page,
  }) => {

    await test.step('Given: navegar a Salidas', async () => {
      await movimientosNav.navegarASalidas();
    });

    await test.step('When: crear nueva salida con almacén y motivo', async () => {
      await registroMovimiento.clickNuevoMovimiento();
      await registroMovimiento.seleccionarAlmacen(ALMACENES.AUTO, ALMACENES.VENTAS);
      await registroMovimiento.seleccionarMotivo(MOTIVOS_SALIDA.VENTA, MOTIVOS_SALIDA.VENTA);
    });

    await test.step('And: buscar y seleccionar producto con cantidad', async () => {
      await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
      await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_GRAVADO.nombre);
      await registroMovimiento.llenarCantidad('10');
    });

    await test.step('And: registrar salida con despacho', async () => {
      await registroMovimiento.clickRegistrarSalida();
      await registroMovimiento.clickRegistrarYDespachar();
    });

    await test.step('Then: ir al listado de movimientos', async () => {
      await resultadoMovimiento.irAlListado();
    });

    await test.step('And: verificar stock disminuido', async () => {
      await movimientosNav.navegarAStockProductos();
      await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
      await stockVerificacion.clickFlechaExpandir();
    });

    await test.step('And: verificar movimiento en kardex', async () => {
      const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
      const kardexPopup = new KardexVerificacionPage(kardexPage);
      await kardexPopup.abrirVerDetalle(0);
      await expect(kardexPage.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
      await kardexPopup.cerrarModalDetalle();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Scenario 8: Registrar salida con insumo
  // ═══════════════════════════════════════════════════════════════
  test('debe registrar una salida con insumo y verificar stock y kardex', async ({
    movimientosNav,
    registroMovimiento,
    resultadoMovimiento,
    stockVerificacion,
    page,
  }) => {

    await test.step('Given: navegar a Salidas', async () => {
      await movimientosNav.navegarASalidasDesdeMenu();
    });

    await test.step('When: crear nueva salida con insumo (almacén por defecto)', async () => {
      await registroMovimiento.clickNuevoMovimiento();
      await registroMovimiento.buscarItem(ITEMS_TEST.INSUMO_FLEXIBLE.codigo);
      await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.INSUMO_FLEXIBLE.nombre);
    });

    await test.step('And: registrar y despachar', async () => {
      await registroMovimiento.clickRegistrarSalida();
      await registroMovimiento.clickRegistrarYDespachar();
      await resultadoMovimiento.irAlListado();
    });

    await test.step('Then: verificar stock del insumo', async () => {
      await movimientosNav.navegarAStockProductos();
      await stockVerificacion.buscarPorCodigo(ITEMS_TEST.INSUMO_FLEXIBLE.codigo);
      await stockVerificacion.clickVariosTexto();
    });

    await test.step('And: verificar movimiento en kardex', async () => {
      await movimientosNav.navegarAKardexTotal();
      await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
      await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill(ITEMS_TEST.INSUMO_FLEXIBLE.codigo);
      await page.getByText('Varios*').click();
      const kardexPage = await page.waitForEvent('popup', async () => {
        await page.getByRole('button', { name: 'Ver Kardex' }).click();
      });
      const kardexPopup = new KardexVerificacionPage(kardexPage);
      await kardexPopup.abrirVerDetalle(0);
      await expect(kardexPage.getByText(MOTIVOS_SALIDA.VENTA)).toBeVisible();
      await expect(kardexPage.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
      await kardexPopup.cerrarModalDetalle();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Scenario 9: Registrar salida con variante
  // ═══════════════════════════════════════════════════════════════
  test('debe registrar una salida con variante y verificar stock y kardex', async ({
    movimientosNav,
    registroMovimiento,
    resultadoMovimiento,
    stockVerificacion,
    page,
  }) => {

    await test.step('Given: estar en lista de salidas y crear nueva salida', async () => {
      // Continúa desde la página anterior (kardex popup)
      await registroMovimiento.clickNuevoMovimiento();
    });

    await test.step('When: buscar variante y registrar salida', async () => {
      await registroMovimiento.buscarItem(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
      await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.VARIANTE_FLEXIBLE.nombre);
      await registroMovimiento.seleccionarVariante(VARIANTES.V2_FLEXIBLE);
      await registroMovimiento.clickTextoRegistrarSalida();
      await registroMovimiento.clickRegistrarYDespachar();
      await resultadoMovimiento.irAlListado();
    });

    await test.step('Then: verificar stock de la variante', async () => {
      await movimientosNav.navegarAStockProductos();
      await stockVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
      await stockVerificacion.clickVariante(VARIANTES.V2_FLEXIBLE);
    });

    await test.step('And: verificar kardex de la variante', async () => {
      const kardexPage = await stockVerificacion.abrirKardexVariante('313131-V002 Variante 2');
      const kardexPopup = new KardexVerificacionPage(kardexPage);
      await kardexPopup.abrirVerDetalle(0);
      await expect(kardexPage.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
      await kardexPopup.cerrarModalDetalle();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Scenario 10: Registrar salida con ítem con equivalencia
  // ═══════════════════════════════════════════════════════════════
  test('debe registrar una salida con ítem con equivalencia y verificar stock', async ({
    movimientosNav,
    registroMovimiento,
    resultadoMovimiento,
    stockVerificacion,
    page,
  }) => {

    await test.step('Given: crear nueva salida con almacén VENTAS', async () => {
      await registroMovimiento.clickNuevoMovimiento();
      await registroMovimiento.seleccionarAlmacen(ALMACENES.AUTO, ALMACENES.VENTAS);
      await page.getByText(MOTIVOS_SALIDA.VENTA).first().click();
      await page.getByText(MOTIVOS_SALIDA.INSUMOS).click();
    });

    await test.step('When: buscar equivalencia y registrar salida', async () => {
      await registroMovimiento.buscarItem(ITEMS_TEST.EQUIVALENTE_FLEX.codigo);
      await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.EQUIVALENTE_FLEX.nombre);
      await page.getByText(ITEMS_TEST.EQUIVALENTE_FLEX.nombre).first().click();
      await registroMovimiento.clickRegistrarSalida();
      await registroMovimiento.clickRegistrarYDespachar();
      await resultadoMovimiento.irAlListado();
    });

    await test.step('Then: verificar stock actualizado', async () => {
      await movimientosNav.navegarAStockProductos();
      await stockVerificacion.buscarPorCodigo(ITEMS_TEST.EQUIVALENTE_FLEX.codigo);
      await stockVerificacion.clickVariosTexto();
    });

    await test.step('And: verificar kardex', async () => {
      const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
      const kardexPopup = new KardexVerificacionPage(kardexPage);
      await kardexPopup.abrirVerDetalle(0);
      await expect(kardexPage.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
      await kardexPopup.cerrarModalDetalle();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Scenario 11: Despachar salida correctamente liberando stock comprometido
  // ═══════════════════════════════════════════════════════════════
  test('debe despachar salida registrada y liberar stock comprometido', async ({
    movimientosNav,
    registroMovimiento,
    resultadoMovimiento,
    listadoMovimientos,
    stockVerificacion,
    page,
  }) => {

    await test.step('Given: navegar a Salidas y crear salida solo registrar (sin despacho)', async () => {
      await movimientosNav.navegarASalidasDesdeMenu();
      await registroMovimiento.clickAgregarSalida();
      await registroMovimiento.buscarItem(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
      await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.VARIANTE_FLEXIBLE.nombre);
      await registroMovimiento.seleccionarVariante(VARIANTES.V3_FLEXIBLE);
      await registroMovimiento.clickTextoRegistrarSalida();
      await registroMovimiento.clickRegistrarSoloSalida();
      await resultadoMovimiento.irAlListado();
    });

    await test.step('And: verificar stock comprometido', async () => {
      await movimientosNav.navegarAStockProductos();
      await stockVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
      await stockVerificacion.clickStockComprometido();
    });

    await test.step('When: despachar la salida desde el listado', async () => {
      await movimientosNav.navegarASalidas();
      await listadoMovimientos.abrirMenuAcciones();
      await listadoMovimientos.clickDespacharSalida();
      await listadoMovimientos.confirmarDespacho();
      await listadoMovimientos.cerrarModal();
    });

    await test.step('Then: verificar stock actualizado tras despacho', async () => {
      await movimientosNav.navegarAStockProductos();
      await stockVerificacion.buscarPorCodigo(ITEMS_TEST.VARIANTE_FLEXIBLE.codigo);
      await stockVerificacion.clickVariante(VARIANTES.V3_FLEXIBLE);
    });

    await test.step('And: verificar kardex de variante', async () => {
      const kardexPage = await stockVerificacion.abrirKardexVariante('313131-V003 Variante 3');
      const kardexPopup = new KardexVerificacionPage(kardexPage);
      await kardexPopup.abrirVerDetalle(0);
      await expect(kardexPage.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
      await kardexPopup.cerrarModalDetalle();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Scenario 12: Registrar salida con datos adicionales
  // ═══════════════════════════════════════════════════════════════
  test('debe registrar salida con datos adicionales (cliente existente)', async ({
    movimientosNav,
    registroMovimiento,
    datosOpcionales,
    resultadoMovimiento,
    stockVerificacion,
    page,
  }) => {

    await test.step('Given: crear nueva salida', async () => {
      await registroMovimiento.clickAgregarSalida();
    });

    await test.step('When: buscar producto y abrir datos opcionales', async () => {
      await registroMovimiento.buscarItem(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
      await registroMovimiento.seleccionarItemEnResultados(ITEMS_TEST.PRODUCTO_GRAVADO.nombre);
      await datosOpcionales.abrirDatosOpcionales();
    });

    await test.step('And: buscar y seleccionar cliente existente', async () => {
      await datosOpcionales.buscarCliente(PROVEEDOR_EXISTENTE.numDocumento);
      await page.getByText(`DNIDNI${PROVEEDOR_EXISTENTE.numDocumento}99999999JHUNIOR`).click();
      await datosOpcionales.guardarDatos();
    });

    await test.step('And: registrar salida con despacho', async () => {
      await registroMovimiento.clickTextoRegistrarSalida();
      await registroMovimiento.clickRegistrarYDespachar();
      await resultadoMovimiento.irAlListado();
    });

    await test.step('Then: verificar stock', async () => {
      await movimientosNav.navegarAStockProductos();
      await stockVerificacion.buscarPorCodigo(ITEMS_TEST.PRODUCTO_GRAVADO.codigo);
      await stockVerificacion.clickVariosTexto();
    });

    await test.step('And: verificar kardex y datos opcionales', async () => {
      const kardexPage = await stockVerificacion.abrirKardexDesdeStock();
      const kardexPopup = new KardexVerificacionPage(kardexPage);
      await kardexPopup.abrirVerDetalle(0);
      await expect(kardexPage.getByText(PATRON_CODIGO.SALIDA).first()).toBeVisible();
      await kardexPopup.clickDatosOpcionales();
      await kardexPopup.cerrarModalDetalle();
    });
  });
});
