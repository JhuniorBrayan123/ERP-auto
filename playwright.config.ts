import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {defineConfig, devices} from "@playwright/test";
import {env} from "./config/env";
import {detectEnvironmentGroup, detectAccount} from "@utils/setup-state";
import {generarSlugCache} from "./src/factories/item-factory";

/**
 * Resuelve dinámicamente el path del storageState según el entorno y cuenta actual.
 *
 * Si el archivo aún no existe (primera ejecución con esta cuenta/ambiente),
 * crea un placeholder vacío para evitar el error ENOENT de Playwright.
 * auth.setup.ts lo sobrescribirá con la sesión real al completar el login.
 *
 * Ej: APP_ENV=crt-3, USER_EMAIL=test@mail.com
 *     → playwright/.auth/user.crt-group__test_at_mail.com.json
 */
function resolveStoragePath(): string {
    const envGroup = detectEnvironmentGroup();
    const account = detectAccount();
    const slug = generarSlugCache(envGroup, account);
    const fullPath = resolve(process.cwd(), 'playwright', '.auth', `user.${slug}.json`);
    if (!existsSync(fullPath)) {
        mkdirSync(dirname(fullPath), {recursive: true});
        writeFileSync(fullPath, '{}', 'utf-8');
        console.log(`[config] StorageState creado (placeholder vacío): user.${slug}.json`);
    }
    return `playwright/.auth/user.${slug}.json`;
}

export default defineConfig({
    testDir: "./tests",

    fullyParallel: true,
    // fullyParallel: false,
    workers: 2,

    forbidOnly: !!process.env.CI,
    retries: 1,

    timeout: 240_000,
    expect: {timeout: 10_000},

    testIgnore: ["**/_*", "**/_codegen/**"],

    reporter: [
        ['./src/utils/maven-reporter.ts'], // consola estilo Maven/Surefire
        ['json', {outputFile: process.env.PW_REPORT_OUTPUT || 'results.json'}],
        ['junit', {outputFile: process.env.PW_JUNIT_OUTPUT || 'junit.xml'}],
        ['html', {outputFolder: process.env.PW_HTML_OUTPUT || 'report', open: 'never'}],
    ],

    use: {
        baseURL: env.baseUrl,

        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",

        actionTimeout: 35_000,
        navigationTimeout: 60_000,
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
                storageState: resolveStoragePath(),
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
                storageState: resolveStoragePath(),
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
                storageState: resolveStoragePath(),
                trace: "retain-on-failure",
            },
            dependencies: ["setup"],
        },
        {
            name: "PuntoVenta",
            testMatch: "tests/Emisiones/**/*.spec.ts",
            use: {
                ...devices["Desktop Chrome"],
                storageState: resolveStoragePath(),
            },
            dependencies: ["setup", "pv-items-setup"],//["setup"],//
            teardown: "pv-teardown",
            workers: 1,
        },
        {
            name: "pv-teardown",
            testMatch: "**/pv-teardown.setup.ts",
            use: {
                ...devices["Desktop Chrome"],
                storageState: resolveStoragePath(),
            }
        },
        {
            name: "Logistica",
            testMatch: "tests/Logistica/**",
            use: {
                ...devices["Desktop Chrome"],
                storageState: resolveStoragePath(),
            },
            dependencies: ["setup"],
            workers: 1,
        },
    ],
});
