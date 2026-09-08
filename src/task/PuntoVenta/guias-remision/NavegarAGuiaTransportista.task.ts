import {expect, Page, test} from '@playwright/test';
import {esperarCargaOverlaySiVisible} from '@utils/wait-helpers';

export const NavegarAGuiaTransportista = () => {
    const fn = async (page: Page) => {
        await test.step('Abrir menú BOLETA', async () => {
            await page.locator('div').filter({hasText: /^BOLETA$/}).nth(1).click();
        });
        await test.step('Seleccionar GUÍA DE REMISIÓN TRANSPORTISTA', async () => {
            await page.getByText('GUÍA DE REMISIÓN TRANSPORTISTA').click();
            await expect(page.getByText('Buscar remitente')).toBeVisible({timeout: 20_000});
            await esperarCargaOverlaySiVisible(page);
        });
    };
    fn.displayName = 'Navegar a Guía de Remisión Transportista';
    return fn;
};
