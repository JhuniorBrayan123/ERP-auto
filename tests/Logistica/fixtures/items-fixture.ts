import { test as base } from '@playwright/test';
import { NavigationPage } from '../pages/NavigationPage';
import { ProductoFormPage } from '../pages/ProductoFormPage';
import { ServicioFormPage } from '../pages/ServicioFormPage';
import { InsumoFormPage } from '../pages/InsumoFormPage';
import { ComboFormPage } from '../pages/ComboFormPage';
import { RecetaFormPage } from '../pages/RecetaFormPage';
import { ListaFormPage } from '../pages/ListaFormPage';
import { ItemDetailPage } from '../pages/ItemDetailPage';

/**
 * Tipos de todas las fixtures disponibles para tests de items.
 */
type ItemsFixtures = {
  navigationPage: NavigationPage;
  productoForm: ProductoFormPage;
  servicioForm: ServicioFormPage;
  insumoForm: InsumoFormPage;
  comboForm: ComboFormPage;
  recetaForm: RecetaFormPage;
  listaForm: ListaFormPage;
  itemDetail: ItemDetailPage;
};

/**
 * Custom test con page objects pre-instanciados.
 *
 * Cada fixture:
 * 1. Navega a la URL base (ya autenticada por storageState)
 * 2. Espera a que el dashboard cargue
 * 3. Navega al módulo Productos y Stock
 * 4. Inyecta los page objects listos para usar
 *
 * Incluye afterEach para imprimir PASS/FAIL en consola.
 */
export const test = base.extend<ItemsFixtures>({
  navigationPage: [async ({ page }, use) => {
    const nav = new NavigationPage(page);
    await page.goto('/');
    await nav.navegarAProductosYStock();
    await use(nav);
  }, { auto: true }],

  productoForm: async ({ page }, use) => {
    await use(new ProductoFormPage(page));
  },

  servicioForm: async ({ page }, use) => {
    await use(new ServicioFormPage(page));
  },

  insumoForm: async ({ page }, use) => {
    await use(new InsumoFormPage(page));
  },

  comboForm: async ({ page }, use) => {
    await use(new ComboFormPage(page));
  },

  recetaForm: async ({ page }, use) => {
    await use(new RecetaFormPage(page));
  },

  listaForm: async ({ page }, use) => {
    await use(new ListaFormPage(page));
  },

  itemDetail: async ({ page }, use) => {
    await use(new ItemDetailPage(page));
  },
});

/**
 * afterEach hook global: Imprime PASS/FAIL en consola tras cada test.
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
