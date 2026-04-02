import { test } from '@playwright/test';
import { InventarioPage } from '../pages/InventarioPage';
import { RecetaListaPage } from '../pages/RecetaListaPage';

/**
 * Tests de creación de listas.
 * Origen: test-1.spec.ts líneas 669-729 (codegen).
 */
test.describe('Creación de Listas', () => {
  test.describe.configure({ mode: 'parallel' });
  test.setTimeout(120_000);

  let inventario: InventarioPage;
  let lista: RecetaListaPage;

  test.beforeEach(async ({ page }) => {
    inventario = new InventarioPage(page);
    lista = new RecetaListaPage(page, inventario);
    await inventario.navegarAProductos();
  });

  /**
   * Lista con ítems estrictos: producto normal, variante, equivalente y selector.
   * Codegen origen: líneas 671-698
   */
  test('Crear lista con items estrictos', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `lista de items estrictos ${fechaHora}`;

    // Act - Crear lista
    await inventario.iniciarCreacionItem('lista');
    await lista.esperarCargaFormularioLista();

    // Act - Nombre
    await lista.llenarNombreLista(nombre);

    // Act - Añadir ítems
    // Producto normal estricto
    await lista.buscarYAgregarItemLista(
      '111111',
      'Pproducto111111Item para combos estricto gravadoS/'
    );

    // Variante estricta
    await lista.limpiarBusqueda();
    await lista.buscarYAgregarItemVarianteLista(
      '131313',
      'Pvproducto131313item variante',
      // Seleccionar primera variante del modal
      'Variante'
    );
    // Fallback: usar locator directo para selección de variante en modal de lista
    await lista.page.locator('.producto').first().click();

    // Equivalente estricto
    await lista.limpiarBusqueda();
    await lista.buscarYAgregarItemEquivalenteLista(
      '101010',
      'Peproducto101010item',
      'item equivalente estricto gravadoFactor Multiplicador:1S/'
    );

    // Selector estricto
    await lista.limpiarBusqueda();
    await lista.buscarYAgregarItemSelectorLista(
      '454545',
      /^Pproducto454545item selector gravado estricto con item manualS\/ 10\.00$/
    );

    // Act - Guardar
    await lista.crearLista();

    // Assert
    await inventario.irAListaDeItems();
  });

  /**
   * Lista con ítems flexibles: producto, variante y equivalente.
   * Codegen origen: líneas 702-729
   */
  test('Crear lista con items flexibles', async () => {
    // Arrange
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombre = `lista de items flexibles ${fechaHora}`;

    // Act - Crear lista
    await inventario.iniciarCreacionItem('lista');
    await lista.esperarCargaFormularioLista();

    // Act - Nombre
    await lista.llenarNombreLista(nombre);

    // Act - Añadir ítems
    // Producto flexible
    await lista.buscarYAgregarItemLista(
      '121212',
      'Pproducto121212item para combos gravado flexibleS/'
    );

    // Variante flexible
    await lista.limpiarBusqueda();
    await lista.buscarYAgregarItemVarianteLista(
      '313131',
      'Pvproducto313131item con variante flexible(Con Variantes)S/',
      'Variante 1 flexibleMarca: AppleRAM: 32 GBMemoria: 500 GBVariante 2'
    );

    // Equivalente estricto (usado en lista flexible)
    await lista.limpiarBusqueda();
    await lista.buscarYAgregarItemEquivalenteLista(
      '101010',
      'Peproducto101010item equivalente estricto gravado(Con Equivalencias)S/',
      'item equivalente estricto gravadoFactor Multiplicador:1S/'
    );

    // Act - Guardar
    await lista.crearLista();

    // Assert - Verificar creación
    await inventario.irAListaDeItems();

    // Verificar vista de listado
    await lista.page.locator('.v-icon-base > .icon').first().click();
    await inventario.opcionVerItemLista.click();
    await lista.page.locator('div').filter({ hasText: /^Ver listado$/ }).click();
    await lista.page.locator('.v-modal > div').first().click();
    await inventario.botonAtras.click();
  });
});
