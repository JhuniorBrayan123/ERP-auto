import {Page} from '@playwright/test';

export const LimpiarCarrito = () =>
    async (page: Page): Promise<void> => {
        await page.getByText('Limpiar carrito').click();
    };