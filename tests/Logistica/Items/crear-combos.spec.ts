import { test } from '@playwright/test';
import { InventarioPage } from '../pages/InventarioPage';
import { ComboPage } from '../pages/ComboPage';

/**
 * Tests de creación de combos.
 * Origen: test-1.spec.ts líneas 230-511 (codegen).
 * Cubre 7 variantes de combo: items normales, equivalentes estrictos/flexibles,
 * selectores, variantes, variantes+equivalencias, combo sobre combo.
 */
test.describe('Creación de Combos', () => {
  test.describe.configure({ mode: 'parallel' });
  test.setTimeout(120_000);

  let inventario: InventarioPage;
  let combo: ComboPage;

  test.beforeEach(async ({ page }) => {
    inventario = new InventarioPage(page);
    combo = new ComboPage(page, inventario);
    await inventario.navegarAProductos();
  });

  /**
   * Combo con dos ítems normales (estricto + flexible) y campos adicionales.
   * Codegen origen: líneas 232-273
   */
  test('Crear combo con items normales estricto y flexible', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `Nuevo combo con items estricto y flexible ${fechaHora}`;

    // Act - Datos básicos
    await inventario.iniciarCreacionItem('combo');
    await combo.llenarNombreYPrecios(nombre, '50', '10');

    // Act - Añadir ítems
    await combo.irATabAnadirItems();
    await combo.buscarYAgregarItem('111111', 'Pproducto111111Item para combos estricto gravado0 un');
    await combo.buscarYAgregarItem('121212', 'item para combos gravado');

    // Act - Categorización
    await inventario.abrirOpcionesAvanzadas();
    await combo.irATabInformacionAdicional();
    await combo.configurarCategorizacionConArrow();

    // Act - Campos adicionales
    await combo.irATabCamposAdicionales();
    await combo.llenarCamposAdicionales('nueco combo desde auto', '122121');

    // Act - Guardar
    await combo.crearCombo();

    // Assert
    await inventario.irAListaDeItems();
  });

  /**
   * Combo con 3 equivalentes estrictos (original + X2 + X6).
   * Codegen origen: líneas 277-313
   */
  test('Crear combo con equivalentes estrictos', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `combo con equivalentes estrictos ${fechaHora}`;

    // Act - Datos básicos
    await inventario.iniciarCreacionItem('combo');
    await combo.llenarNombreYPrecios(nombre, '14', '14');

    // Act - Añadir ítems con equivalencias
    await combo.irATabAnadirItems();
    await combo.buscarYAgregarItemEquivalente(
      '101010',
      'Peproducto101010item equivalente estricto gravado(Con Equivalencias)0 un',
      'item equivalente estricto gravadoFactor Multiplicador:1S/'
    );
    await combo.buscarYAgregarItemEquivalente(
      '101010',
      'Peproducto101010item equivalente estricto gravado(Con Equivalencias)0 un',
      'Equivalente X2Factor'
    );
    await combo.buscarYAgregarItemEquivalente(
      '101010',
      'item equivalente estricto',
      'Equivalencia X6Factor'
    );

    // Act - Categorización
    await inventario.abrirOpcionesAvanzadas();
    await combo.irATabInformacionAdicional();
    await combo.configurarCategorizacionConNinguna();

    // Act - Guardar
    await combo.crearCombo();

    // Assert
    await inventario.irAListaDeItems();
    await inventario.verificarBitacoraDesdeGrid();
  });

  /**
   * Combo con 3 equivalentes flexibles (original + X2 + X6).
   * Codegen origen: líneas 317-350
   */
  test('Crear combo con equivalentes flexibles', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `Combo con item equivalente flexible ${fechaHora}`;

    // Act - Datos básicos
    await inventario.iniciarCreacionItem('combo');
    await combo.llenarNombreYPrecios(nombre, '11', '11');

    // Act - Añadir ítems con equivalencias flexibles
    await combo.irATabAnadirItems();
    await combo.buscarYAgregarItemEquivalente(
      '202020',
      'Peproducto202020item equivalente flexible exonerado(Con Equivalencias)0 un',
      'item equivalente flexible exoneradoFactor Multiplicador:1S/'
    );
    await combo.buscarYAgregarItemEquivalente(
      '202020',
      'Peproducto202020item equivalente flexible exonerado(Con Equivalencias)0 un',
      'Equivalente X2Factor'
    );
    await combo.buscarYAgregarItemEquivalente(
      '202020',
      'Peproducto202020item',
      'Equivalencia X6Factor'
    );

    // Act - Categorización
    await inventario.abrirOpcionesAvanzadas();
    await combo.irATabInformacionAdicional();
    await combo.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await combo.page.locator('div').filter({ hasText: /^AUTO-TEST$/ }).nth(2).click();
    await combo.page.locator(
      'div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow'
    ).click();
    await combo.page.getByText('AUTOMATIZADO').click();

    // Act - Guardar
    await combo.crearCombo();

    // Assert
    await inventario.irAListaDeItems();
    await inventario.verificarBitacoraDesdeGrid();
  });

  /**
   * Combo con ítems tipo selector (estricto y flexible).
   * Codegen origen: líneas 354-386
   */
  test('Crear combo con selectores estrictos', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `Combo con item selectores estrictos ${fechaHora}`;

    // Act - Datos básicos
    await inventario.iniciarCreacionItem('combo');
    await combo.llenarNombreYPrecios(nombre, '22', '22');

    // Act - Añadir ítems selectores
    await combo.irATabAnadirItems();
    await combo.buscarYAgregarItem('454545', 'Pproducto454545item selector gravado estricto con item manual0 un');
    await combo.buscarYAgregarItemSelector('545454', 'Pproducto545454item selector flexible0 un');

    // Act - Categorización
    await inventario.abrirOpcionesAvanzadas();
    await combo.irATabInformacionAdicional();
    await combo.configurarCategorizacionConNinguna();

    // Act - Guardar
    await combo.crearCombo();

    // Assert
    await inventario.irAListaDeItems();
  });

  /**
   * Combo con ítems variantes estrictos y flexibles (3 variantes de cada uno).
   * Codegen origen: líneas 389-437
   */
  test('Crear combo con variantes estrictas y flexibles', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `Combo con item variantes ${fechaHora}`;

    // Act - Datos básicos
    await inventario.iniciarCreacionItem('combo');
    await combo.inputNombre.fill(nombre);

    // Act - Precios (se establecen después de ir al tab y volver)
    await combo.inputMontoSoles.fill('15');
    await combo.inputMontoDolares.fill('15');

    // Act - Añadir variantes estrictas (producto 131313)
    await combo.irATabAnadirItems();
    await combo.buscarYAgregarItemVariante(
      '131313', 'Pvproducto131313item variante', [0]
    );
    await combo.buscarYAgregarItemVariante(
      '131313', 'Pvproducto131313item variante', [1]
    );
    await combo.buscarYAgregarItemVariante(
      '131313', 'Pvproducto', [2]
    );

    // Act - Añadir variantes flexibles (producto 313131)
    await combo.buscarYAgregarItemVariante(
      '313131', 'Pvproducto313131item con variante flexible(Con Variantes)0 un', [0]
    );
    await combo.buscarYAgregarItemVariante(
      '313131', 'Pvproducto313131item con variante flexible(Con Variantes)0 un', [1]
    );
    await combo.buscarYAgregarItemVariante(
      '313131', 'Pvproducto313131item con variante flexible(Con Variantes)0 un', [2]
    );

    // Act - Categorización
    await inventario.abrirOpcionesAvanzadas();
    await combo.page.getByText('Campos adicionales(Opcional)').click();
    await combo.page.getByText('(Opcional)').first().click();
    await combo.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await combo.page.locator('div').filter({ hasText: /^AUTO-TEST$/ }).nth(2).click();
    await combo.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await combo.page.locator('div').filter({ hasText: /^AUTOMATIZADO$/ }).first().click();

    // Act - Guardar
    await combo.crearCombo();

    // Assert
    await inventario.irAListaDeItems();
    await inventario.verificarBitacoraDesdeGrid();
  });

  /**
   * Combo con ítems variantes estrictos + equivalentes estrictos.
   * Codegen origen: líneas 442-483
   */
  test('Crear combo con variantes y equivalencias estrictas', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `Combo item variantes y equivalentes ${fechaHora}`;

    // Act - Datos básicos
    await inventario.iniciarCreacionItem('combo');
    await combo.llenarNombreYPrecios(nombre, '22', '12');

    // Act - Añadir variantes
    await combo.irATabAnadirItems();
    await combo.buscarYAgregarItemVariante(
      '131313', 'Pvproducto131313item variante estricto gravado(Con Variantes)0 un', [0]
    );
    await combo.buscarYAgregarItemVariante(
      '131313', 'Pvproducto131313item variante', [1]
    );
    await combo.buscarYAgregarItemVariante(
      '131313', 'Pvproducto131313item variante estricto gravado(Con Variantes)0 un', [2]
    );

    // Act - Añadir equivalentes
    await combo.buscarYAgregarItemEquivalente(
      '101010',
      'Peproducto101010item equivalente estricto gravado(Con Equivalencias)0 un',
      'item equivalente estricto gravadoFactor Multiplicador:1S/'
    );
    await combo.buscarYAgregarItemEquivalente(
      '101010',
      'Peproducto101010item equivalente estricto gravado(Con Equivalencias)0 un',
      'Equivalente X2Factor'
    );

    // Act - Categorización
    await combo.page.getByText('Opciones avanzadas (opcional)').click();
    await combo.irATabInformacionAdicional();
    await combo.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await combo.page.locator('div').filter({ hasText: /^AUTO-TEST$/ }).first().click();
    await combo.page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await combo.page.locator('div').filter({ hasText: /^AUTOMATIZADO$/ }).nth(2).click();

    // Act - Guardar
    await combo.crearCombo();

    // Assert
    await inventario.irAListaDeItems();
    await inventario.verificarBitacoraDesdeGrid();
  });

  /**
   * Combo que contiene otro combo hijo (combo sobre combo).
   * Codegen origen: líneas 487-511
   */
  test('Crear combo exonerado sobre combo', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `combo sobre combo ${fechaHora}`;

    // Act - Datos básicos
    await inventario.iniciarCreacionItem('combo');
    await combo.llenarNombreYPrecios(nombre, '13', '13');

    // Act - Añadir combo hijo
    await combo.page.getByText('Añadir ítems').click();
    await combo.buscarYAgregarItem('22222', 'combo hijo exonegaro item');

    // Act - Guardar
    await combo.crearCombo();

    // Assert
    await inventario.irAListaDeItems();
    await inventario.verificarBitacoraDesdeGrid();
  });
});
