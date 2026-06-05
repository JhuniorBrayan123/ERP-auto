import {Page, test} from '@playwright/test';

export const NavegarAGuiaRemitente = () => {
    const fn = async (page: Page) => {
        await test.step('Abrir menú BOLETA', async () => {
            await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
        });
        await test.step('Seleccionar GUÍA DE REMISIÓN REMITENTE', async () => {
            await page.getByText('GUÍA DE REMISIÓN REMITENTE').click();
        });
    };
    fn.displayName = 'Navegar a Guía de Remisión Remitente';
    return fn;
};
