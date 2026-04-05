import { test as base } from '@playwright/test';
import { NavigationPage } from '../pages/NavigationPage';
import { ListaItemsPage } from '../pages/ListaItemsPage';
import { EdicionItemPage } from '../pages/EdicionItemPage';
import { ItemDetailPage } from '../pages/ItemDetailPage';

/**
 * Tipos de las fixtures disponibles para tests de edición y clonado.
 */
type EdicionClonadoFixtures = {
  navigationPage: NavigationPage;
  listaItems: ListaItemsPage;
  edicionItem: EdicionItemPage;
  itemDetail: ItemDetailPage;
};

/**
 * Custom test con page objects para edición y clonado de ítems.
 *
 * Cada test:
 * 1. Navega a la URL base (ya autenticada por storageState)
 * 2. Navega al módulo Productos y Stock
 * 3. Inyecta los page objects listos para usar:
 *    - listaItems: búsqueda por código y menú de acciones
 *    - edicionItem: formulario de edición/clonado
 *    - itemDetail: verificación en vista de detalle
 *
 * Incluye afterEach para imprimir PASS/FAIL en consola.
 */
export const test = base.extend<EdicionClonadoFixtures>({
  navigationPage: [async ({ page }, use) => {
    const nav = new NavigationPage(page);
    await page.goto('/');
    await nav.navegarAProductosYStock();
    await use(nav);
  }, { auto: true }],

  listaItems: async ({ page }, use) => {
    await use(new ListaItemsPage(page));
  },

  edicionItem: async ({ page }, use) => {
    await use(new EdicionItemPage(page));
  },

  itemDetail: async ({ page }, use) => {
    await use(new ItemDetailPage(page));
  },
});

/**
 * afterEach hook: Imprime PASS/FAIL en consola tras cada test.
 * Facilita la lectura de resultados en Jenkins y terminal.
 */
test.afterEach(async ({}, testInfo) => {
  const status = testInfo.status === 'passed' ? ' PASS' : ' FAIL';
  const duracion = ((testInfo.duration ?? 0) / 1000).toFixed(1);
  const mensaje = `${status}: ${testInfo.title} (${duracion}s)`;

  if (testInfo.status !== 'passed' && testInfo.error) {
    console.log(`${mensaje} → ${testInfo.error.message}`);
  } else {
    console.log(mensaje);
  }
});

export { expect } from '@playwright/test';
