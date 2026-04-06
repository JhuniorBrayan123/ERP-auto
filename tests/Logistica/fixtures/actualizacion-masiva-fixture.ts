import { test as base } from '@playwright/test';
import { NavigationPage } from '../pages/NavigationPage';
import { ActualizacionMasivaPage } from '../pages/ActualizacionMasivaPage';
import { ListaItemsPage } from '../pages/ListaItemsPage';
import { ItemDetailPage } from '../pages/ItemDetailPage';

type ActualizacionMasivaFixtures = {
  navigationPage: NavigationPage;
  actualizacionMasiva: ActualizacionMasivaPage;
  /** Lista con búsqueda y espera de carga (mismo patrón que edición de ítem). */
  listaItems: ListaItemsPage;
  /** Ver ítem / bitácora / visualizar stock (reutilizado desde specs de edición). */
  itemDetail: ItemDetailPage;
};

/**
 * Navegación autenticada + menú "Actualizar masiva" abierto.
 * `BASE_URL` y credenciales vienen de `.env` / storageState (sin hardcode en specs).
 */
export const test = base.extend<ActualizacionMasivaFixtures>({
  navigationPage: [
    async ({ page }, use) => {
      const nav = new NavigationPage(page);
      await page.goto('/');
      await nav.navegarAProductosYStock();
      await use(nav);
    },
    { auto: true },
  ],

  actualizacionMasiva: async ({ page }, use) => {
    const act = new ActualizacionMasivaPage(page);
    await act.abrirActualizacionMasiva();
    await use(act);
  },

  listaItems: async ({ page }, use) => {
    await use(new ListaItemsPage(page));
  },

  itemDetail: async ({ page }, use) => {
    await use(new ItemDetailPage(page));
  },
});

test.afterEach(async ({}, testInfo) => {
  const ok = testInfo.status === 'passed';
  const status = ok ? 'PASS' : 'FAIL';
  const duracion = ((testInfo.duration ?? 0) / 1000).toFixed(1);
  const line = `${status}: ${testInfo.title} (${duracion}s)`;
  if (ok) {
    console.log(line);
  } else {
    console.log(
      `${line}${testInfo.error ? ` → ${testInfo.error.message}` : ''}`,
    );
  }
});

export { expect } from '@playwright/test';
