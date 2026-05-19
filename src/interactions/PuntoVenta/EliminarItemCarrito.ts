// 📁 src/interactions/PuntoVenta/EliminarItemCarrito.ts
import { Page } from '@playwright/test';

const BTN_CANCELAR = '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-cancelar"]';

export const EliminarItemCarrito = (indice: number = 0) => {
    const fn = async (page: Page): Promise<void> => {
        await page.locator(BTN_CANCELAR).nth(indice).click();
    };
    fn.displayName = 'Eliminar item del carrito';
    return fn;
};
