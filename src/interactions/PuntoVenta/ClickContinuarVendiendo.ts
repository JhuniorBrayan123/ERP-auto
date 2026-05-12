// 📁 src/interactions/PuntoVenta/ClickContinuarVendiendo.ts
import { Page } from '@playwright/test';

export const ClickContinuarVendiendo = () =>
    async (page: Page): Promise<void> => {
        await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    };
