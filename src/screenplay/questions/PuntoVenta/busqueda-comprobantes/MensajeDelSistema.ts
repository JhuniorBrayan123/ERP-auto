import {Page} from '@playwright/test';

export class MensajeDelSistema {
    static texto() {
        const fn = async (page: Page): Promise<string> => {
            
            return (await page.locator('body').textContent()) ?? '';
        };
        return fn;
    }
}
