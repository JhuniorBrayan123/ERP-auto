import {type Page} from '@playwright/test';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

export const ToggleSliderEstadoConductor = () => {
    const fn = async (page: Page): Promise<void> => {
        
        
        
        await ConductoresTargets.sliderEstado(page).click();
    };
    fn.displayName = 'Toggle slider de estado de conductor';
    return fn;
};
