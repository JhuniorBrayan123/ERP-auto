// 📁 src/task/PuntoVenta/FiltrarPorListaPrecios.task.ts
// SC-02: Cambiar lista de precios → seleccionar item → validar moneda
import { Page } from '@playwright/test';

export const FiltrarPorListaPrecios = (listaPreciosOrigen: string, listaPreciosDestino: string) =>
    async (page: Page): Promise<void> => {
        await page.getByText(listaPreciosOrigen).first().click();
        await page.getByText(listaPreciosDestino).click();
        // Navegar por paginado
        await page.getByRole('link', { name: '2' }).click();
        await page.getByRole('link', { name: '1' }).click();
        // Seleccionar un item
        await page.locator('.image-default').first().click();
    };
