// 📁 src/interactions/PuntoVenta/ClickImagenDefault.ts
import { Page } from '@playwright/test';

export const ClickImagenDefault = (veces: number = 1) => {
    const fn = async (page: Page): Promise<void> => {
        for (let i = 0; i < veces; i++) {
            await page.locator('.image-default').first().click();
        }
    };
    fn.displayName = 'Click imagen default';
    return fn;
};
