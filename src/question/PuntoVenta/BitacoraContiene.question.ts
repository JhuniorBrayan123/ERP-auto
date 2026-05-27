import {type Page} from '@playwright/test';

export const BitacoraContiene = (texto: string) =>
    async (page: Page): Promise<boolean> => {
        try {
            await page.getByText(texto).first().waitFor({ state: 'visible', timeout: 10_000 });
            return true;
        } catch {
            return false;
        }
    };
