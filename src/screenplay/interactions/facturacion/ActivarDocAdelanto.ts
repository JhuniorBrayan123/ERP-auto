import {expect, type Page} from '@playwright/test';

export const ActivarDocAdelanto = () => {
    const fn = async (page: Page): Promise<void> => {
        
        const selectorInput = '[id$="_v-switch:documento-adelanto"]';
        
        const input = page.locator(selectorInput);
        const label = page.locator(`label:has(${selectorInput})`);

        await expect(label).toBeVisible({timeout: 10_000});

        const isChecked = await input.evaluate((el: HTMLInputElement) => el.checked);
        if (!isChecked) {
            await label.scrollIntoViewIfNeeded();
            await label.click();
            await page.waitForTimeout(500); 
        }


        await expect(input).toBeChecked({timeout: 5_000});
    };
    fn.displayName = 'Activar switch Documento de Adelanto';
    return fn;
};
