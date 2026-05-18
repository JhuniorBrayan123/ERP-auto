// 📁 src/interactions/PuntoVenta/DecrementarCantidadCarrito.ts
import { Page } from '@playwright/test';

const DECREMENT_BTN = '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:decrement"]';

export const DecrementarCantidadCarrito = (veces: number = 1) => {
    const fn = async (page: Page): Promise<void> => {
        for (let i = 0; i < veces; i++) {
            await page.locator(DECREMENT_BTN).click();
        }
    };
    fn.displayName = 'Decrementar cantidad en carrito';
    return fn;
};
