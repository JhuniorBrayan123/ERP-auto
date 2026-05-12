// 📁 src/interactions/PuntoVenta/ClickLimpiarCarrito.ts
import { Page } from '@playwright/test';

export const ClickLimpiarCarrito = () =>
    async (page: Page): Promise<void> => {
        await page.getByText('Limpiar carrito').click();
    };
