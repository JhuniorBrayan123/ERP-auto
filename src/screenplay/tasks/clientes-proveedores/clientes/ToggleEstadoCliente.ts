import {expect, type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

export const DesactivarCliente = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.botonContextual(page).click();
        await page.getByText('Desactivar cliente').click();
        await ClientesTargets.btnCerrarDrape(page).waitFor({state: 'visible', timeout: 10_000}).catch(() => {});
    };
    fn.displayName = 'Desactivar cliente';
    return fn;
};

export const ActivarCliente = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.botonContextual(page).click();
        await page.getByText('Activar cliente').click();
    };
    fn.displayName = 'Activar cliente';
    return fn;
};

export const ToggleSliderEstado = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.sliderEstado(page).click();
    };
    fn.displayName = 'Toggle slider estado';
    return fn;
};
