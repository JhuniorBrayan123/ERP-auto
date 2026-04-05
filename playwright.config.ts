import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

const testEnv = process.env.TEST_ENV || 'qa';
// Silenciar los mensajes ruidosos y publicidad de dotenv (los "[dotenv...] tip:")
process.env.DOTENV_QUIET = 'true';
process.env.DOTENV_SUPPRESS_WARNINGS = 'true';
dotenv.config({ path: path.resolve(__dirname, `.env.${testEnv}`) });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno: ${name}`);
  }
  return value;
}

const baseURL = required('BASE_URL');

export default defineConfig({
  testDir: './tests',

  /* ─── Ejecución secuencial para estabilidad ─── */
  fullyParallel: false,
  workers: 1,

  /* ─── CI / Retries ─── */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  /* ─── Timeouts para estabilidad ─── */
  timeout: 60_000,           // 60s por test
  expect: { timeout: 10_000 }, // 10s para assertions

  /* ─── Ignorar archivos con prefijo _ (codegen de referencia) ─── */
  testIgnore: ['**/_*'],

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