import {type Page} from '@playwright/test';

export const SeleccionarSerie = (serie: string) => {
    const fn = async (page: Page): Promise<void> => {
        await page.locator('div').filter({ hasText: new RegExp(`^${serie}$`) }).nth(1).click();
        await page.getByText(serie, { exact: true }).last().click();
    };
    fn.displayName = `Seleccionar serie: ${serie}`;
    return fn;
};
