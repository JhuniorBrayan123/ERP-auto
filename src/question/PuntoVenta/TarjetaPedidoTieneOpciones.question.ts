import {expect, type Page} from '@playwright/test';

export const TarjetaPedidoTieneOpciones = (referencia: string) =>
    async (page: Page): Promise<boolean> => {
        try {
            const tarjeta = page.locator('.item-card').filter({hasText: referencia}).first();
            await tarjeta.waitFor({state: 'visible', timeout: 5_000});
            const btnOpciones = tarjeta.locator('[id*="cmp-dropdown:opciones-pedido"]');
            await expect(btnOpciones).toBeVisible({timeout: 5_000});
            return true;
        } catch {
            return false;
        }
    };
