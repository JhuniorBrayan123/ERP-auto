import {Page} from '@playwright/test';

export const FiltrarPorAlmacen = (almacenOrigen: string, almacenDestino: string) => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByText(almacenOrigen).first().click();
        await page.getByText(almacenDestino).click();
        
        await page.getByRole('link', {name: '2'}).click();
        await page.getByRole('link', {name: '3'}).click();
        await page.locator('.image-default').first().click();
    };
    fn.displayName = 'Filtrar por almacén';
    return fn;
};
