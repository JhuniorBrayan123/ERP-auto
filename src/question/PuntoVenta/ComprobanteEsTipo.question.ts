import {type Page} from '@playwright/test';

export const ComprobanteEsTipo = (tipo: string) =>
    async (page: Page): Promise<boolean> => {
        try {
            await page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]')
                .filter({ hasText: tipo })
                .waitFor({ state: 'visible', timeout: 10_000 });
            return true;
        } catch {
            return false;
        }
    };
