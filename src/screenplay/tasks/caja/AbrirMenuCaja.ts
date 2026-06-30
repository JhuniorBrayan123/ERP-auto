import {expect, type Page} from '@playwright/test';
import {MenuCajaTargets} from '@screenplay/targets/caja/MenuCajaTargets';


export const AbrirMenuCaja = () => {
    const fn = async (page: Page): Promise<void> => {
        const isMenuOpen = await page.locator('.cmp-overscreen.is-open').isVisible();
        if (!isMenuOpen) {
            await MenuCajaTargets.btnAbrirMenu(page).click();
        }

        await expect(MenuCajaTargets.opcionIngresoDinero(page)).toBeVisible({timeout: 10_000});
    };

    fn.displayName = 'Abrir menú lateral de caja';
    return fn;
};


export const RegresarANuevaVenta = () => {
    const fn = async (page: Page): Promise<void> => {
        const isMenuOpen = await page.locator('.cmp-overscreen.is-open').isVisible();
        if (!isMenuOpen) {
            await MenuCajaTargets.btnAbrirMenu(page).click();
        }
        await MenuCajaTargets.opcionNuevaVenta(page).click();
    };

    fn.displayName = 'Regresar a Nueva venta desde menú';
    return fn;
};
