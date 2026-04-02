import { test } from '@playwright/test';
import { InventarioPage } from '../pages/InventarioPage';
import { RecetaListaPage } from '../pages/RecetaListaPage';

/**
 * Tests de creación de recetas.
 * Origen: test-1.spec.ts líneas 514-667 (codegen).
 */
test.describe('Creación de Recetas', () => {
  test.describe.configure({ mode: 'parallel' });
  test.setTimeout(120_000);

  let inventario: InventarioPage;
  let receta: RecetaListaPage;

  test.beforeEach(async ({ page }) => {
    inventario = new InventarioPage(page);
    receta = new RecetaListaPage(page, inventario);
    await inventario.navegarAProductos();
  });

  /**
   * Receta con insumos normales, insumo con equivalencias y insumo flexible.
   * Codegen origen: líneas 517-560
   */
  test('Crear receta con insumos y equivalencias', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `nueva receta con items estrictos ${fechaHora}`;

    // Act - Datos básicos
    await inventario.iniciarCreacionItem('receta');
    await receta.llenarNombreYPreciosReceta(nombre, '11', '3.5');

    // Act - Añadir insumos
    await receta.irATabAnadirItemsReceta();
    await receta.buscarYAgregarItem('444444', 'Iinsumo444444Nuevo insumo0 un');

    await receta.limpiarBusqueda();
    await receta.buscarYAgregarItem('464646', 'Iinsumo464646Nuevo insumo test10 un');

    // Insumo con equivalencia - original
    await receta.buscarYAgregarItemEquivalente(
      '444666',
      'Ieinsumo444666nuevo insumo',
      'nuevo insumo con equivalencias estrictoFactor Multiplicador:1S/'
    );
    // Insumo con equivalencia - equivalenteX2
    await receta.buscarYAgregarItemEquivalente(
      '444666',
      'Ieinsumo444666nuevo insumo con equivalencias estricto(Con Equivalencias)0 un',
      'equivalenteX2 insumoFactor'
    );

    // Insumo flexible
    await receta.buscarYAgregarItemPorDiv('666444', /^Iinsumo666444nuevo insumo flexible0 un$/);

    // Act - Categorización
    await inventario.abrirOpcionesAvanzadas();
    await receta.irATabInfoAdicionalReceta();
    await receta.configurarCategorizacionReceta();

    // Act - Guardar
    await receta.crearReceta();

    // Assert
    await inventario.irAListaDeItems();
    await inventario.verificarBitacoraDesdeGrid();
  });

  /**
   * Receta con ítems estrictos mixtos: productos normales, equivalentes, selectores y variantes.
   * Codegen origen: líneas 565-613
   */
  test('Crear receta con items estrictos mixtos', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `receta con items estrictos mixtos ${fechaHora}`;

    // Act - Datos básicos
    await inventario.iniciarCreacionItem('receta');
    await receta.llenarNombreYPreciosReceta(nombre, '10.10', '22');

    // Act - Añadir ítems estrictos de distintos tipos
    await receta.irATabAnadirItemsReceta();

    // Producto normal
    await receta.buscarYAgregarItem('111111', 'Pproducto111111Item para');

    // Equivalente - original
    await receta.limpiarBusqueda();
    await receta.buscarYAgregarItemEquivalente(
      '101010',
      'Peproducto101010item',
      'item equivalente estricto gravadoFactor Multiplicador:1S/'
    );
    // Equivalente X2
    await receta.buscarYAgregarItemEquivalente(
      '101010',
      'Peproducto101010item equivalente estricto gravado(Con Equivalencias)0 un',
      'Equivalente X2Factor'
    );

    // Selector
    await receta.limpiarBusqueda();
    await receta.buscarYAgregarItemPorDiv('454545', /^Pproducto454545item selector gravado estricto con item manual0 un$/);

    // Variante
    await receta.buscarYAgregarItemVariante(
      '131313', 'Pvproducto131313item variante', [0, 0]
    );

    // Act - Categorización
    await inventario.abrirOpcionesAvanzadas();
    await receta.irATabInfoAdicionalReceta();
    await receta.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await receta.page.locator('div').filter({ hasText: /^AUTO-TEST$/ }).nth(2).click();
    await receta.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await receta.page.getByText('AUTOMATIZADO').click();

    // Descripción
    await receta.llenarDescripcionReceta(
      'nuevo auto con items estrictos(variantes, equivalentes, selectores y items normales)'
    );

    // Act - Guardar
    await receta.crearReceta();

    // Assert
    await inventario.irAListaDeItems();
    await inventario.verificarBitacoraDesdeGrid();
  });

  /**
   * Receta con ítems flexibles: producto, variante, equivalentes y selector.
   * Incluye corrección de nombre por duplicado.
   * Codegen origen: líneas 617-667
   */
  test('Crear receta con items flexibles', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `receta con items flexibles ${fechaHora}`;

    // Act - Datos básicos
    await inventario.iniciarCreacionItem('receta');
    await receta.llenarNombreYPreciosReceta(nombre, '11', '11');

    // Act - Añadir ítems flexibles
    await receta.irATabAnadirItemsReceta();

    // Producto flexible
    await receta.buscarYAgregarItem('121212', 'Pproducto121212item para combos gravado flexible0 un');

    // Variante flexible
    await receta.buscarYAgregarItemVariante(
      '313131', 'Pvproducto313131item con', [0]
    );

    // Equivalente flexible - X2
    await receta.limpiarBusqueda();
    await receta.buscarYAgregarItemEquivalente(
      '202020',
      'Peproducto202020item',
      'Equivalente X2Factor'
    );
    // Equivalente flexible - X6
    await receta.buscarYAgregarItemEquivalente(
      '202020',
      'Peproducto202020item equivalente flexible exonerado(Con Equivalencias)0 un',
      'Equivalencia X6Factor'
    );

    // Selector flexible
    await receta.buscarYAgregarItemPorDiv('545454', /^Pproducto545454item selector flexible0 un$/);

    // Insumo flexible
    await receta.buscarYAgregarItem('666444', 'Iinsumo666444nuevo insumo flexible0 un');

    // Act - Categorización
    await inventario.abrirOpcionesAvanzadas();
    await receta.page.getByText('Información adicional').click();
    await receta.configurarCategorizacionRecetaAlt();

    // Act - Guardar (puede requerir corrección de nombre)
    await receta.crearReceta();

    // Si falla por nombre duplicado, corregir y reintentar
    await receta.corregirNombreYRecrear(`receta con items flexibles test-auto ${fechaHora}`);

    // Assert
    await inventario.irAListaDeItems();
    await inventario.verificarBitacoraDesdeGrid();
  });
});
