import {type Page} from '@playwright/test';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

export const ToggleSliderEstadoVendedor = (_accion?: string) => {
    const fn = async (page: Page): Promise<void> => {
        await VendedoresTargets.sliderEstado(page).click();
    };
    fn.displayName = 'Toggle slider de estado de vendedor';
    return fn;
};
