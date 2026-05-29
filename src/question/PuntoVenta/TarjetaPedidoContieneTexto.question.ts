import {expect, type Page} from '@playwright/test';

export const TarjetaPedidoContieneTexto = (referencia: string, texto: string) =>
    async (page: Page): Promise<boolean> => {
        try {
            const tarjeta = page.locator('.item-card').filter({hasText: referencia}).first();
            await tarjeta.waitFor({state: 'visible', timeout: 5_000});
            await expect(tarjeta).toContainText(texto);
            return true;
        } catch {
            return false;
        }
    };
