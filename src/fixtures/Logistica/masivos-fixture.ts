import { test as base } from '@playwright/test';
import { NavigationPage } from '../../pages/Logistica/NavigationPage';
import { CargaMasivaPage } from '../../pages/Logistica/CargaMasivaPage';

/**
 * Tipos de fixtures para tests de carga masiva.
 */
type MasivosFixtures = {
  navigationPage: NavigationPage;
  cargaMasiva: CargaMasivaPage;
};

/**
 * Custom test con page objects para carga masiva.
 *
 * Cada test:
 * 1. Navega a la URL base (ya autenticada por storageState)
 * 2. Espera a que el dashboard cargue
 * 3. Navega al módulo Productos y Stock
 * 4. Abre el flujo de carga masiva
 * 5. Inyecta CargaMasivaPage listo para usar
 *
 * Incluye afterEach para imprimir PASS/FAIL en consola.
 */
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
