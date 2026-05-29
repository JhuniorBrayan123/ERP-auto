import {type Page} from '@playwright/test';

export const TarjetaPedidoVisible = (referencia: string) =>
    async (page: Page): Promise<boolean> => {
        try {
            const tarjeta = page.locator('.item-card').filter({hasText: referencia}).first();
            await tarjeta.waitFor({state: 'visible', timeout: 10_000});
            return true;
        } catch {
            return false;
        }
    };
