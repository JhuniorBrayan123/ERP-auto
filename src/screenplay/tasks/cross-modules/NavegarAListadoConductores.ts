import {Page} from "@playwright/test";

export const NavegarAListadoConductores = () => {
    const fn = async (page: Page): Promise<void> => {
        await page.goto('/punto-venta/entidades/conductores');
        await page.waitForLoadState('networkidle').catch(() => {
        });
    };
    fn.displayName = 'Navegar a Listado de Conductores';
    return fn;
};