import {Page} from '@playwright/test';

export const BuscarYAgregarProducto = (codigoProducto: string) =>
    async (page: Page): Promise<void> => {
        await page.getByRole('button', {name: 'Continuar vendiendo'}).click();

        const buscador = page.getByRole('textbox', {name: 'Escanea o busca por nombre, c'});
        await buscador.click();
        await buscador.fill(codigoProducto);

        await page.getByText('Lista items flexibles 27-4-').click();
        await page.locator('.v-step.selector').first().click();
        await page.locator('[id="_div:increase"]').first().click();

        await page.getByRole('button', {name: 'Agregar a venta'}).click();
    };