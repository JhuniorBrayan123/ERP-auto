// src/questions/PuntoVenta/TotalDeVenta.ts
import {Page} from '@playwright/test';

export const TotalDeVenta = async (page: Page): Promise<string> => {
    return await page.getByTestId('total-venta').innerText();
};