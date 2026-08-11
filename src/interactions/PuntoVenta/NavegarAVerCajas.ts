import { Page } from '@playwright/test';

export const NavegarAVerCajas = () => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByText('Ventas y compras').click();
        await page.getByText('Ver cajas').click();
    };
    fn.displayName = 'Navegar a ver cajas';
    return fn;
};
