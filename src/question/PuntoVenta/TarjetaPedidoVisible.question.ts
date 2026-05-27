import {type Page} from '@playwright/test';

/**
 * Verifica que una tarjeta de pedido con la referencia dada
 * (ej: "PD01-125") sea visible en la lista de pedidos.
 *
 * La tarjeta es el contenedor .item-card que agrupa los datos
 * de un pedido (cliente, caja, monto, acciones).
 */
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
