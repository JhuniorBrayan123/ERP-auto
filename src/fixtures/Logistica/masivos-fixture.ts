import { test as base } from '@playwright/test';
import { NavigationPage } from '@pages/Logistica/NavigationPage';
import { CargaMasivaPage } from '@pages/Logistica/CargaMasivaPage';

type MasivosFixtures = {
  navigationPage: NavigationPage;
  cargaMasiva: CargaMasivaPage;
};

export const test = base.extend<MasivosFixtures>({
  navigationPage: [async ({ page }, use) => {
    const nav = new NavigationPage(page);
    await page.goto('/');
    await nav.navegarAProductosYStock();
    await use(nav);
  }, { auto: true }],

  cargaMasiva: async ({ page }, use) => {
    const masiva = new CargaMasivaPage(page);
    await masiva.abrirCargaMasiva();
    await use(masiva);
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
