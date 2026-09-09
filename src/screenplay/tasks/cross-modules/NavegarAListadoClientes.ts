import {Page} from "@playwright/test";
import {esperarCargaOverlay, esperarCargaOverlaySiVisible} from "@utils/wait-helpers";

export const NavegarAListadoClientes = () => {
    const fn = async (page: Page): Promise<void> => {
        await page.goto('/punto-venta/entidades/clientes');
        await esperarCargaOverlaySiVisible(page);
    };
    fn.displayName = 'Navegar a Listado de Clientes';
    return fn;
};