import { test } from '@playwright/test';
import { InventarioPage } from '../pages/InventarioPage';
import { InsumoPage } from '../pages/InsumoPage';

test.describe('Creación de Insumos', () => {
  test.describe.configure({ mode: 'parallel' });
  test.setTimeout(120_000);

  let inventario: InventarioPage;
  let insumo: InsumoPage;

  test.beforeEach(async ({ page }) => {
    inventario = new InventarioPage(page);
    insumo = new InsumoPage(page, inventario);
    await inventario.navegarAProductos();
  });


  test('Crear insumo sin control de stock', async () => {
    // --
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `Nuevo insumo ${fechaHora}`;

    // Act - Crear insumo
    await inventario.iniciarCreacionItem('insumo');
    await insumo.llenarNombre(nombre);
    await inventario.abrirOpcionesAvanzadas();


    // Act - Stock sin control
    await insumo.irATabStock();
    await insumo.seleccionarControlStock('sin-control');

    // Act - Categorización
    await insumo.irATabInformacionAdicional();
    await insumo.configurarCategorizacionConArrow();

    // Act - Guardar
    await insumo.crearInsumo();

    // Assert
    await inventario.irAListaDeItems();
  });


  test('Crear insumo con control estricto y campos adicionales', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `Nuevo insumo test1 ${fechaHora}`;

    // Act - Crear insumo
    await inventario.iniciarCreacionItem('insumo');
    await insumo.llenarNombre(nombre);
    await inventario.abrirOpcionesAvanzadas();

    // Act - Stock estricto
    await insumo.irATabStock();
    await insumo.seleccionarControlStock('estricto');
    await insumo.llenarCantidadesAlmacen('100', '100');

    // Act - Categorización
    await insumo.irATabInformacionAdicional();
    await insumo.configurarCategorizacion();

    // Act - Campos adicionales
    await insumo.irATabCamposAdicionales();
    await insumo.llenarCamposAdicionales('nuevo insumo desde auto', '12121');
    await insumo.seleccionarUnidadMedidaCrt();

    // Act - Guardar
    await insumo.crearInsumo();

    // Assert - Verificar bitácora
    await inventario.irAListaDeItems();
    await inventario.verificarBitacoraDesdeGrid();
  });

  test('Crear insumo estricto con equivalencias', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `Nuevo insumo tessss ${fechaHora}`;

    // Act - Crear insumo
    await inventario.iniciarCreacionItem('insumo');
    await insumo.llenarNombre(nombre);
    await inventario.abrirOpcionesAvanzadas();

    // Act - Stock estricto
    await insumo.irATabStock();
    await insumo.seleccionarControlStock('estricto');
    await insumo.llenarCantidadesAlmacen('100', '100');

    // Act - Categorización
    await insumo.irATabInformacionAdicional();
    await insumo.configurarCategorizacion();

    // Act - Equivalencia
    await insumo.irATabEquivalencias();
    await insumo.crearEquivalencia('equivalenteX2 insumo', 2);

    // Act - Guardar
    await insumo.crearInsumo();

    // Assert
    await inventario.irAListaDeItems();
    await inventario.verificarBitacoraDesdeGrid();
  });

  test('Crear insumo con control flexible', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `Nuevo insumo tetesss ${fechaHora}`;

    // Act - Crear insumo
    await inventario.iniciarCreacionItem('insumo');
    await insumo.llenarNombre(nombre);
    await inventario.abrirOpcionesAvanzadas();

    // Act - Stock flexible
    await insumo.irATabStock();
    await insumo.seleccionarControlStock('flexible');
    await insumo.llenarCantidadesAlmacen('100', '100');

    // Act - Info adicional (solo tab, sin categorización en este flujo)
    await insumo.irATabInformacionAdicional();

    // Act - Guardar
    await insumo.crearInsumo();

    // Assert
    await inventario.irAListaDeItems();
  });
});
