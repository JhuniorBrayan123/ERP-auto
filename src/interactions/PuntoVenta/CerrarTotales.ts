// 📁 src/interactions/PuntoVenta/CerrarTotales.ts
import { Page } from '@playwright/test';

export const CerrarTotales = () =>
    async (page: Page): Promise<void> => {
        await page.locator('.button-close').first().click();
    };
