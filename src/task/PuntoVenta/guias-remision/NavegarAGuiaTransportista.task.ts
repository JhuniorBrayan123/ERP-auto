import {Page} from '@playwright/test';

export const NavegarAGuiaTransportista = () => {
    return async (page: Page) => {
        await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
        await page.getByText('GUÍA DE REMISIÓN TRANSPORTISTA').click();
    };
};
