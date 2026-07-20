import {type Page} from '@playwright/test';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

export const ToggleSliderEstadoConductor = () => {
    const fn = async (page: Page): Promise<void> => {
        // En el codegen, a veces se hace clic en algo con clase .v-icon-base > .icon y luego en .slider
        // O directamente en la opción del menú y luego en el modal .slider. 
        // Usaremos .slider que es el estándar.
        await ConductoresTargets.sliderEstado(page).click();
    };
    fn.displayName = 'Toggle slider de estado de conductor';
    return fn;
};
