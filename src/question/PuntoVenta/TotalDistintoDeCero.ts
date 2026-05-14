// 📁 src/question/PuntoVenta/TotalDistintoDeCero.ts
import {Page} from '@playwright/test';

export const TotalDistintoDeCero = () =>
    async (page: Page): Promise<boolean> => {
        const textoTotal = await page
            .locator('.monto .v-h4')  // el span con el valor numérico
            .first()
            .textContent();

        return textoTotal?.trim() !== '0.00';
    };