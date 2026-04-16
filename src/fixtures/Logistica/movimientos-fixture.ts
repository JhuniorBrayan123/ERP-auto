import { test as base } from '@playwright/test';
import { MovimientosNavigationPage } from '../../pages/Logistica/MovimientosNavigationPage';
import { RegistroMovimientoPage } from '../../pages/Logistica/RegistroMovimientoPage';
import { ResultadoMovimientoPage } from '../../pages/Logistica/ResultadoMovimientoPage';
import { ListadoMovimientosPage } from '../../pages/Logistica/ListadoMovimientosPage';
import { StockVerificacionPage } from '../../pages/Logistica/StockVerificacionPage';
import { KardexVerificacionPage } from '../../pages/Logistica/KardexVerificacionPage';
import { DatosOpcionalesPage } from '../../pages/Logistica/DatosOpcionalesPage';
import { MovimientoRapidoPage } from '../../pages/Logistica/MovimientoRapidoPage';

/**
 * Tipos de todas las fixtures disponibles para tests de Movimientos de Logística.
 */
type MovimientosFixtures = {
  movimientosNav: MovimientosNavigationPage;
  registroMovimiento: RegistroMovimientoPage;
  resultadoMovimiento: ResultadoMovimientoPage;
  listadoMovimientos: ListadoMovimientosPage;
  stockVerificacion: StockVerificacionPage;
  kardexVerificacion: KardexVerificacionPage;
  datosOpcionales: DatosOpcionalesPage;
  movimientoRapido: MovimientoRapidoPage;
};

/**
 * Custom test con page objects pre-instanciados para Movimientos de Logística.
 *
 * Cada fixture:
 * 1. Navega a la URL base (ya autenticada por storageState)
 * 2. Inyecta movimientosNav con auto:true (navega automáticamente)
 * 3. Los demás page objects se inyectan a demanda
 *
 * La navegación al submódulo específico (Ingresos, Salidas, etc.)
 * se hace en cada spec según su necesidad usando movimientosNav.
 *
 * Incluye afterEach para imprimir PASS/FAIL en consola.
 */
export const test = base.extend<MovimientosFixtures>({
  movimientosNav: [async ({ page }, use) => {
    const nav = new MovimientosNavigationPage(page);
    await page.goto('/');
    await use(nav);
  }, { auto: true }],

  registroMovimiento: async ({ page }, use) => {
    await use(new RegistroMovimientoPage(page));
  },

  resultadoMovimiento: async ({ page }, use) => {
    await use(new ResultadoMovimientoPage(page));
  },

  listadoMovimientos: async ({ page }, use) => {
    await use(new ListadoMovimientosPage(page));
  },

  stockVerificacion: async ({ page }, use) => {
    await use(new StockVerificacionPage(page));
  },

  kardexVerificacion: async ({ page }, use) => {
    await use(new KardexVerificacionPage(page));
  },

  datosOpcionales: async ({ page }, use) => {
    await use(new DatosOpcionalesPage(page));
  },

  movimientoRapido: async ({ page }, use) => {
    await use(new MovimientoRapidoPage(page));
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
