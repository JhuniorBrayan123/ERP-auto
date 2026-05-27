import {type Page} from '@playwright/test';

export const FiltrarListaPedidosPorCaja = (nombreCaja: string) => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByText('Caja', { exact: true }).click();
        await page.getByRole('textbox', { name: 'Buscar por nombre de caja' }).click();
        await page.locator('[id*="opcion-caja"]').filter({ hasText: nombreCaja }).first().click();
    };
    fn.displayName = `Filtrar pedidos por caja: ${nombreCaja}`;
    return fn;
};
