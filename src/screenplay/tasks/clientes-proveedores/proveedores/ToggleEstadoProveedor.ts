import {type Page} from '@playwright/test';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

export const ToggleSliderEstadoProveedor = () => {
    const fn = async (page: Page): Promise<void> => {
        
        
        
        await ProveedoresTargets.sliderEstado(page).click();
    };
    fn.displayName = 'Toggle slider de estado de proveedor';
    return fn;
};
