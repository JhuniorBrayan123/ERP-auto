import {expect, type Page} from '@playwright/test';

export const GrillaContiene = (texto: string) =>
    async (page: Page): Promise<boolean> => {
        try {
            await expect(page.locator('tbody')).toContainText(texto, { timeout: 10_000 });
            return true;
        } catch {
            return false;
        }
    };
