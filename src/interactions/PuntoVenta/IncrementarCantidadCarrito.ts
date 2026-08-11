import { Page } from '@playwright/test';

const INCREASE_BTN = '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]';

export const IncrementarCantidadCarrito = (veces: number = 1) => {
    const fn = async (page: Page): Promise<void> => {
        for (let i = 0; i < veces; i++) {
            await page.locator(INCREASE_BTN).click();
        }
    };
    fn.displayName = 'Incrementar cantidad en carrito';
    return fn;
};
