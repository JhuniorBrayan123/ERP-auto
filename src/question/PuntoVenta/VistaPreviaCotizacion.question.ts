import { expect, type Page } from '@playwright/test';

export const VistaPreviaCotizacion = {

    async esperarVistaPrevia(page: Page) {
        const wrapper = page.locator('.page-wrapper').first();
        await wrapper.waitFor({ state: 'visible', timeout: 15_000 });
        return wrapper;
    },

    contieneImagen: () => {
        return async (page: Page): Promise<boolean> => {
            const wrapper = await VistaPreviaCotizacion.esperarVistaPrevia(page);
            try {
                await wrapper.locator('img').first().waitFor({
                    state: 'visible',
                    timeout: 10_000
                });
                return true;
            } catch {
                return false;
            }
        };
    },

    contieneDescripcion: (descripcionEsperada: string) => {
        return async (page: Page): Promise<boolean> => {
            const wrapper = await VistaPreviaCotizacion.esperarVistaPrevia(page);
            try {
                await expect(wrapper).toContainText(descripcionEsperada, {
                    timeout: 10_000
                });
                return true;
            } catch {
                return false;
            }
        };
    }

};