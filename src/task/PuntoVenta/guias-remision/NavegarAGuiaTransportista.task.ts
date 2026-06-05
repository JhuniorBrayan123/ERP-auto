import {expect, Page} from '@playwright/test';
import {esperarCargaOverlay} from '@utils/wait-helpers';

export const NavegarAGuiaTransportista = () => {
    const fn = async (page: Page) => {
        await page.locator('div').filter({hasText: /^BOLETA$/}).nth(1).click();
        await page.getByText('GUÍA DE REMISIÓN TRANSPORTISTA').click();
        await expect(page.getByText('Buscar remitente')).toBeVisible({timeout: 20_000});
        await esperarCargaOverlay(page);
    };
    fn.displayName = 'Navegar a Guía de Remisión Transportista';
    return fn;
};
