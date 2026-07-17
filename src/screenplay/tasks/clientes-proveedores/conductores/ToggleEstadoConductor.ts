import {type Page} from '@playwright/test';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

export const DesactivarConductor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ConductoresTargets.botonContextual(page).click();
        await page.getByText('Desactivar conductor').click();
        await ConductoresTargets.btnCerrarDrape(page).waitFor({state: 'visible', timeout: 10_000}).catch(() => {});
    };
    fn.displayName = 'Desactivar conductor';
    return fn;
};

export const ActivarConductor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ConductoresTargets.botonContextual(page).click();
        await page.getByText('Activar conductor').click();
    };
    fn.displayName = 'Activar conductor';
    return fn;
};

export const ToggleSliderEstadoConductor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ConductoresTargets.sliderEstado(page).click();
    };
    fn.displayName = 'Toggle slider estado';
    return fn;
};
