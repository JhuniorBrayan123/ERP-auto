import {Page} from "@playwright/test";
import {esperarCargaOverlaySiVisible} from "@utils/wait-helpers";

export const NavegarAListadoVendedores = () => {
    const fn = async (page: Page): Promise<void> => {
        await page.goto('/punto-venta/entidades/vendedores');
        await esperarCargaOverlaySiVisible(page);
    };
    fn.displayName = 'Navegar a Listado de Vendedores';
    return fn;
};