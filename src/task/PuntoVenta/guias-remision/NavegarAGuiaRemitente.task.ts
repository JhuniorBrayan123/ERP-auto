import {Page} from '@playwright/test';

export const NavegarAGuiaRemitente = () => {
    return async (page: Page) => {
        await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
        await page.getByText('GUÍA DE REMISIÓN REMITENTE').click();
    };
};
