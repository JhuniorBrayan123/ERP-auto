import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {defineConfig, devices} from "@playwright/test";
import {env} from "./config/env";
import {detectAccount, detectEnvironmentFine} from "./src/utils/setup-state";
import {generarSlugCache} from "./src/factories/item-factory";

function resolveStoragePath(): string {
    const envGroup = detectEnvironmentFine();
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

const isCI = !!process.env.CI;
export default defineConfig({
    testDir: "./tests",

    fullyParallel: false,
    // fullyParallel: false,
    workers: 2,

    forbidOnly: !!process.env.CI,
    retries: isCI ? 2 : 1,

    timeout: 240_000,
    expect: {timeout: 10_000},

    testIgnore: ["**/_*", "**/_codegen/**"],

    reporter: [
        ["./src/utils/maven-reporter.ts"], // consola estilo Maven/Surefire
        ["json", {outputFile: process.env.PW_REPORT_OUTPUT || "results.json"}],
        ["junit", {outputFile: process.env.PW_JUNIT_OUTPUT || "junit.xml"}],
        [
            "html",
            {outputFolder: process.env.PW_HTML_OUTPUT || "report", open: "never"},
        ],
    ],

    use: {
        baseURL: env.baseUrl,

        trace: isCI ? "retain-on-failure" : "off",
        screenshot: "only-on-failure",
        video: isCI ? "retain-on-failure" : "off",

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
            // Excluye Facturacion/ — esos specs tienen su propio proyecto aislado
            testMatch: "tests/Emisiones/**/*.spec.ts",
            testIgnore: ["**/Facturacion/**"],
            use: {
                ...devices["Desktop Chrome"],
                storageState: resolveStoragePath(),
            },
            dependencies: ["setup", "pv-items-setup"],
            teardown: "pv-teardown",
            workers: isCI ? 2 : 1,
        },
        {
            // Vista Facturación es GLOBAL por empresa.
            // NO correr en paralelo con PuntoVenta ni con Facturacion.
            // mode:'serial' forzado dentro del spec.
            name: "Facturacion-Vista",
            testMatch: "tests/Emisiones/Facturacion/vista-facturacion/**/*.spec.ts",
            use: {
                ...devices["Desktop Chrome"],
                storageState: resolveStoragePath(),
            },
            dependencies: ["setup", "pv-items-setup"],
            workers: 1,
        },
        {
            // Tests transaccionales de Facturación — correlativo via API intercept.
            // No correr junto con vista-facturacion (ya excluido por testMatch).
            name: "Facturacion",
            testMatch: "tests/Emisiones/Facturacion/**/*.spec.ts",
            testIgnore: ["**/vista-facturacion/**"],
            use: {
                ...devices["Desktop Chrome"],
                storageState: resolveStoragePath(),
            },
            dependencies: ["setup", "pv-items-setup"],
            teardown: "pv-teardown",
            workers: isCI ? 2 : 1,
        },
        {
            name: "pv-teardown",
            testMatch: "**/pv-teardown.setup.ts",
            use: {
                ...devices["Desktop Chrome"],
                storageState: resolveStoragePath(),
                trace: "off",
                video: "off",
            },
        },
        {
            name: "Logistica",
            testMatch: "tests/Logistica/**",
            use: {
                ...devices["Desktop Chrome"],
                storageState: resolveStoragePath(),
            },
            dependencies: ["setup"],
            workers: isCI ? 2 : 1,
        },
    ],
});
