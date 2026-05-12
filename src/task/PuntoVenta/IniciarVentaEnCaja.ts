import {expect, Page} from '@playwright/test';

export const IniciarVentaEnCaja = () =>
    async (page: Page): Promise<void> => {
        await page.goto('/');
        await page.getByText('Ventas y compras').click();
        await page.getByText('Ver cajas').click();
        await page.getByRole('button', {name: 'Continuar vendiendo'}).click();

        // Estabilidad heredada de POM: 
        // Esperamos a que los selectores de la cabecera (Almacén, Lista de precios) se llenen
        await expect(
            page.locator('.v-select-header-small .v-text').first()
        ).not.toHaveText('Seleccionar', {timeout: 15_000});
    };
