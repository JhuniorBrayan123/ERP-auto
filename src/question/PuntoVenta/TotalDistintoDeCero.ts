import {Page, expect} from '@playwright/test';

export const TotalDistintoDeCero = () =>
    async (page: Page): Promise<boolean> => {
        try {
            await expect(page.locator('.monto .v-h4').first()).not.toHaveText('0.00', { timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    };