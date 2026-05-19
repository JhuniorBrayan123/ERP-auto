// 📁 src/interactions/PuntoVenta/ClickLimpiarCarrito.ts
import { Page } from '@playwright/test';

export const ClickLimpiarCarrito = () => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByText('Limpiar carrito').click();
    };
    fn.displayName = 'Limpiar carrito';
    return fn;
};
