import {defineConfig, devices} from '@playwright/test';
import {env} from './config/env';

export default defineConfig({
    testDir: './tests',

    /**
     * Estabilidad (ERP, datos compartidos, wizards):
     * - fullyParallel: false + workers: 1 evitan choques entre escenarios masivos.
     * Los specs de actualización masiva viven en tests/logistica/productos-stock/edicion-masiva/.
     */
    fullyParallel: false,
    // fullyParallel: true,
    workers: 1,
    // workers: process.env ? 2 : 2,

    /* ─── CI / Retries ─── */
    forbidOnly: !!process.env.CI,
    retries: 1,

    /* ─── Timeouts para estabilidad ─── */
    timeout: 240_000,           // 3 min  por test por si
    expect: {timeout: 10_000}, // 10s para assertions

    /* ─── Ignorar codegen / borradores (no son suites de regresión) ─── */
    testIgnore: ['**/_*', '**/_codegen/**'],

    /* ─── Reporters ─── */
    // === CONFIGURACIÓN ANTERIOR (Comentada por seguridad) ===

    reporter: [
        // ['list'], //nativo
        ['./src/utils/maven-reporter.ts'],                   // consola estilo Maven/Surefire
        ['html', {open: 'never'}],                           // reporte HTML
        ['junit', {outputFile: 'test-results/results.xml'}], // Jenkins
        //['./src/utils/discord-reporter.ts'],
    ],
    // // === NUEVA CONFIGURACIÓN DINÁMICA ===
    // reporter: process.env.CI ? [
    //     // ️ Entorno CI (Jenkins/GitHub Actions):
    //     ['dot'],                                              // Máxima velocidad I/O (1 puntito por test)
    //     ['junit', { outputFile: 'test-results/results.xml' }] // Integración CI clásica
    // ] : [
    //     //  Entorno Local:
    //     ['line'],                                             // Terminal limpia de una sola línea
    //     ['html', { open: 'on-failure' }],                     // Super poder: Auto-abre el reporte solo si fallas
    //     // ['./src/utils/maven-reporter.ts'],                 // Tu custom reporter estilo Maven
    // ],


    use: {
        baseURL: env.baseUrl,

        // === CONFIGURACIÓN ANTERIOR (Comentada por seguridad) ===
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

        // /* ─── Artefactos de Evidencia ─── */
        // // Guarda la evidencia visual (Trace, Screenshot, Video) ÚNICAMENTE cuando ocurre un fallo
        // trace: 'retain-on-failure',
        // screenshot: 'only-on-failure',
        // video: 'retain-on-failure',

        /* ─── Timeouts ─── */
        actionTimeout: 35_000,      // 15s por acción individual
        navigationTimeout: 60_000,  // 30s para navegación
    },

    projects: [
        {
            name: 'setup',
            testMatch: '**/auth.setup.ts',
        },
        {
            name: 'datos-setup',
            testMatch: '**/datos-adicionales.setup.ts',
            retries: 0,
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'playwright/.auth/user.json',
            },
            // dependencies: ['setup', 'datos-setup'],
            dependencies: ['setup'],
        },
    ],
});