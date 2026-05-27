import {expect, type Page} from '@playwright/test';

/**
 * Verifica que la tarjeta de pedido tenga el botón de opciones
 * (desplegable con acciones como Ver pedido / Cargar pedido).
 */
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
