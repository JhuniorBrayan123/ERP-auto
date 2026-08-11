import { expect, test as base } from '@playwright/test';
import { Cajero } from '@actors/cajero';
import { ReportesTargets } from '@screenplay/targets/reportes/ReportesTargets';
import { esperarCargaOverlay } from '@utils/wait-helpers';

type ReportesFixtures = {
    reportes: Cajero;
    reportesListo: void;
};

export const test = base.extend<ReportesFixtures>({
    reportes: async ({ page, reportesListo: _ }, use) => {
        await use(Cajero.con(page));
    },

    reportesListo: [async ({ page }, use) => {
        await page.goto('/');
        await page.getByText('Ventas y compras').click();
        await page.getByText('Reportes', { exact: true }).click();
        await page.getByText('Resumen de ventas', { exact: true }).click();

        await page.waitForLoadState('networkidle').catch(() => {
        });
        await esperarCargaOverlay(page).catch(() => {
        });

        // Fallback por URL directa (real, verificada en apply) si la navegación
        // por menú no llegó al reporte.
        await page.waitForURL(/reportes/, { timeout: 15_000 }).catch(async () => {
            await page.goto(ReportesTargets.urlResumenVentas);
            await esperarCargaOverlay(page).catch(() => {
            });
        });

        await use();
    }, { auto: true }],
});

export { expect } from '@playwright/test';
