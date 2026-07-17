import {type Page} from '@playwright/test';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

export const DesactivarVendedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await VendedoresTargets.botonContextual(page).click();
        await page.getByText('Desactivar vendedor').click();
        await VendedoresTargets.btnCerrarDrape(page).waitFor({state: 'visible', timeout: 10_000}).catch(() => {});
    };
    fn.displayName = 'Desactivar vendedor';
    return fn;
};

export const ActivarVendedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await VendedoresTargets.botonContextual(page).click();
        await page.getByText('Activar vendedor').click();
    };
    fn.displayName = 'Activar vendedor';
    return fn;
};

export const ToggleSliderEstadoVendedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await VendedoresTargets.sliderEstado(page).click();
    };
    fn.displayName = 'Toggle slider estado';
    return fn;
};
