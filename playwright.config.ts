import { defineConfig, devices } from "@playwright/test";
import { env } from "./config/env";

export default defineConfig({
  testDir: "./tests",

  fullyParallel: true,
  // fullyParallel: false,
  workers: 2,

  /* ─── CI / Retries ─── */
  forbidOnly: !!process.env.CI,
  retries: 1,

  /* ─── Timeouts para estabilidad ─── */
  timeout: 240_000, // 3 min  por test por si
  expect: { timeout: 10_000 }, // 10s para assertions

  /* ─── Ignorar codegen / borradores (no son suites de regresión) ─── */
  testIgnore: ["**/_*", "**/_codegen/**"],

  /* ─── Reporters ─── */
  reporter: [
    ["./src/utils/maven-reporter.ts"], // consola estilo Maven/Surefire
    ["json", { outputFile: process.env.PW_REPORT_OUTPUT || "results.json" }],
    ["junit", { outputFile: process.env.PW_JUNIT_OUTPUT || "junit.xml" }],
    [
      "html",
      { outputFolder: process.env.PW_HTML_OUTPUT || "report", open: "never" },
    ],
  ],

  use: {
    baseURL: env.baseUrl,

    // === CONFIGURACIÓN ANTERIOR (Comentada por seguridad) ===

    // Trace en fallos para poder abrir con: npx playwright show-trace trace.zip
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Video solo en fallos para no saturar disco en ejecuciones largas
    video: "retain-on-failure",

    /* ─── Timeouts ─── */
    actionTimeout: 35_000, // 15s por acción individual
    navigationTimeout: 60_000, // 30s para navegación
  },

  projects: [
    {
      name: "setup",
      testMatch: "**/auth.setup.ts",
      use: {
        trace: "retain-on-failure",
      },
    },
    {
      name: "datos-setup",
      testMatch: "**/datos-adicionales.setup.ts",
      retries: 0,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
        trace: "retain-on-failure",
      },
      dependencies: ["setup"],
    },
    {
      name: "pv-datos-setup",
      testMatch: "**/punto-venta-datos.setup.ts",
      retries: 0,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
        trace: "retain-on-failure",
      },
      dependencies: ["setup"],
    },
    {
      name: "pv-items-setup",
      testMatch: "**/punto-venta-items.setup.ts",
      retries: 0,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
        trace: "retain-on-failure",
      },
      dependencies: ["setup"],
    },
    {
      name: "PuntoVenta",
      testMatch: "tests/Emisiones/**/*.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup", "pv-items-setup"], //["setup"],//
      workers: 1,
    },
    {
      name: "Logistica",
      testMatch: "tests/Logistica/**",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup", "pv-items-setup"], //["setup"],
      workers: 1,
    },
    {
      name: "scripts-tests",
      testMatch: "tests/utility-analyze-results.spec.ts",
    },
  ],
});
