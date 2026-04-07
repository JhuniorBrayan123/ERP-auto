import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Lee la configuración desde un único archivo: config/environment.env
 * Para cambiar de entorno (QA, PRD, etc.), solo edita ese archivo.
 */
dotenv.config({ path: path.resolve(__dirname, 'config', 'environment.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno: ${name} — revisa config/environment.env`);
  }
  return value;
}

const baseURL = required('BASE_URL');

export default defineConfig({
  testDir: './tests',

  /**
   * Estabilidad (ERP, datos compartidos, wizards):
   * - fullyParallel: false + workers: 1 evitan choques entre escenarios masivos.
   * Los specs de actualización masiva viven en tests/Logistica/ActualizacionMasiva/.
   */
  fullyParallel: false,
  workers: 1,

  /* ─── CI / Retries ─── */
  forbidOnly: !!process.env.CI,
  retries: 2,

  /* ─── Timeouts para estabilidad ─── */
  timeout: 60_000,           // 60s por test
  expect: { timeout: 10_000 }, // 10s para assertions

  /* ─── Ignorar codegen / borradores (no son suites de regresión) ─── */
  testIgnore: ['**/_*', '**/_codegen/**'],

  /* ─── Reporters ─── */
  reporter: [
    ['list'],                                          // consola legible
    ['html', { open: 'never' }],                       // reporte HTML
    ['junit', { outputFile: 'test-results/results.xml' }], // Jenkins
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,      // 15s por acción individual
    navigationTimeout: 30_000,  // 30s para navegación
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});