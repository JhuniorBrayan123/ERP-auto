import { expect, type Page } from '@playwright/test';

export const VistaPreviaCotizacion = {
    contieneImagen: () => {
        return async (page: Page): Promise<boolean> => {
            const vistaPreviaModal = page.locator('.v-dialog--active, .vista-previa-container').first();
            try {
                await vistaPreviaModal.locator('img').first().waitFor({ state: 'visible', timeout: 10_000 });
                return true;
            } catch {
                return false;
            }
        };
    },
    contieneDescripcion: (descripcionEsperada: string) => {
        return async (page: Page): Promise<boolean> => {
            const vistaPreviaModal = page.locator('.v-dialog--active, .vista-previa-container').first();
            try {
                await expect(vistaPreviaModal).toContainText(descripcionEsperada, { timeout: 10_000 });
                return true;
            } catch {
                return false;
            }
        };
    }
};
