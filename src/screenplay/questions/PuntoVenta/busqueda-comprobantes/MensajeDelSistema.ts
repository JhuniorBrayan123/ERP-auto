import {Page} from '@playwright/test';

export class MensajeDelSistema {
    static texto() {
        const fn = async (page: Page): Promise<string> => {
            // Un enfoque pragmático para leer el body textContent para aserciones toContain
            return (await page.locator('body').textContent()) ?? '';
        };
        return fn;
    }
}
