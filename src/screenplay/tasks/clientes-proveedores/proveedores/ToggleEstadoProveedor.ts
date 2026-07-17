import {type Page} from '@playwright/test';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

export const DesactivarProveedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.botonContextual(page).click();
        await page.getByText('Desactivar proveedor').click();
        await ProveedoresTargets.btnCerrarDrape(page).waitFor({state: 'visible', timeout: 10_000}).catch(() => {});
    };
    fn.displayName = 'Desactivar proveedor';
    return fn;
};

export const ActivarProveedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.botonContextual(page).click();
        await page.getByText('Activar proveedor').click();
    };
    fn.displayName = 'Activar proveedor';
    return fn;
};

export const ToggleSliderEstadoProveedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.sliderEstado(page).click();
    };
    fn.displayName = 'Toggle slider estado';
    return fn;
};
