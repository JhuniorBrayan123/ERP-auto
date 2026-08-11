import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {defineConfig, devices, type ReporterDescription} from "@playwright/test";
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

// Gate: solo se registra (y por tanto se instancia) con DISCORD_REPORT_ENABLED === '1'.
// Apagado → inerte: sin HTTP, sin errores, sin instanciar el reporter.
const discordReporter: ReporterDescription[] =
    process.env.DISCORD_REPORT_ENABLED === "1" ? [["./src/utils/discord-reporter.ts"]] : [];

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

    outputDir: "report/artifacts",

    reporter: [
        ["./src/utils/maven-reporter.ts"], // consola estilo Maven/Surefire
        ["json", { outputFile: process.env.PW_REPORT_OUTPUT || "test-results/results.json" }],
        ["html", {
            outputFolder: process.env.PW_HTML_OUTPUT || "report/html",
            open: "never"
        }],
        ...discordReporter,
    ],

    use: {
        baseURL: env.baseUrl,

        trace: isCI ? "retain-on-failure" : "on",
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
            name: "pv-euro-setup",
            testMatch: "**/punto-venta-euro.setup.ts",
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
            testIgnore: ["**/Facturacion/**"],
            use: {
                ...devices["Desktop Chrome"],
                storageState: resolveStoragePath(),
            },
            dependencies: ["setup", "pv-items-setup", "pv-euro-setup"],
            teardown: "pv-teardown",
            workers: isCI ? 2 : 1,
        },
        {
            name: "Facturacion",
            testMatch: "tests/Emisiones/Facturacion/**/*.spec.ts",
            use: {
                ...devices["Desktop Chrome"],
                storageState: resolveStoragePath(),
            },
            dependencies: ["setup", "pv-items-setup", "pv-euro-setup"],
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
            testIgnore: ["**/*.setup.ts"],
            use: {
                ...devices["Desktop Chrome"],
                storageState: resolveStoragePath(),
            },
            dependencies: ["setup", "datos-setup"],
            workers: isCI ? 2 : 1,
        },
        {
            name: "Clientes",
            testMatch: "tests/ClientesProveedores/**",
            testIgnore: ["**/*.setup.ts"],
            use: {
                ...devices["Desktop Chrome"],
                storageState: resolveStoragePath(),
            },
            dependencies: ["setup"],
            workers: isCI ? 2 : 1,
        },
    ],
});
