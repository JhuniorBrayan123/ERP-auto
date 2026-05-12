// 📁 src/interactions/PuntoVenta/ClickAceptarModal.ts
import { Page } from '@playwright/test';

export const ClickAceptarModal = () =>
    async (page: Page): Promise<void> => {
        await page.getByRole('button', { name: 'Aceptar' }).click();
    };
