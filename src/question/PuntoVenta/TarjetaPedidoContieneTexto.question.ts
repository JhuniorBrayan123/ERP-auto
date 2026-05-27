import {expect, type Page} from '@playwright/test';

/**
 * Verifica que la tarjeta de pedido con la referencia dada
 * contenga un texto específico (ej: nombre del cliente, caja, etc.).
 *
 * Útil para validar datos visibles dentro de la tarjeta sin
 * acoplar el test a selectores CSS.
 */
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
