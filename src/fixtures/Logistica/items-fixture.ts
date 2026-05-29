import { test as base } from '@playwright/test';
import { NavigationPage } from '../../pages/Logistica/NavigationPage';
import { ProductoFormPage } from '../../pages/Logistica/ProductoFormPage';
import { ServicioFormPage } from '../../pages/Logistica/ServicioFormPage';
import { InsumoFormPage } from '../../pages/Logistica/InsumoFormPage';
import { ComboFormPage } from '../../pages/Logistica/ComboFormPage';
import { RecetaFormPage } from '../../pages/Logistica/RecetaFormPage';
import { ListaFormPage } from '../../pages/Logistica/ListaFormPage';
import { ItemDetailPage } from '../../pages/Logistica/ItemDetailPage';

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
