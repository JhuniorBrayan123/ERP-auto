import {Page} from '@playwright/test';

export const FiltrarPorAlmacen = (almacenOrigen: string, almacenDestino: string) =>
    async (page: Page): Promise<void> => {
        await page.getByText(almacenOrigen).first().click();
        await page.getByText(almacenDestino).click();
        // Navegar por paginado para confirmar que la grilla cambió
        await page.getByRole('link', {name: '2'}).click();
        await page.getByRole('link', {name: '3'}).click();
        // Seleccionar un item de la grilla filtrada
        await page.locator('.image-default').first().click();
    };
