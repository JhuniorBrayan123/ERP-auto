// 📁 src/interactions/PuntoVenta/NavegarAVerCajas.ts
import { Page } from '@playwright/test';

export const NavegarAVerCajas = () =>
    async (page: Page): Promise<void> => {
        await page.getByText('Ventas y compras').click();
        await page.getByText('Ver cajas').click();
    };
