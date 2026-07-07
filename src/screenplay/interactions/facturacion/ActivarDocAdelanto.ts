import {expect, type Page} from '@playwright/test';

export const ActivarDocAdelanto = () => {
    const fn = async (page: Page): Promise<void> => {
        // Soporta tanto Factura/Boleta (cmp-factura-boleta-header) como Nota de Venta (cmp-nota-venta-header)
        const selectorInput = '[id$="_v-switch:documento-adelanto"]';
        
        const input = page.locator(selectorInput);
        const label = page.locator(`label:has(${selectorInput})`);

        await expect(label).toBeVisible({timeout: 10_000});

        const isChecked = await input.evaluate((el: HTMLInputElement) => el.checked);
        if (!isChecked) {
            await label.scrollIntoViewIfNeeded();
            await label.click();
            await page.waitForTimeout(500); // Dar tiempo a Vue de actualizar el DOM
        }


        await expect(input).toBeChecked({timeout: 5_000});
    };
    fn.displayName = 'Activar switch Documento de Adelanto';
    return fn;
};
