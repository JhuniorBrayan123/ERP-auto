import {type Page} from '@playwright/test';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';

export const ToggleSliderEstadoConductor = (_accion?: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ConductoresTargets.sliderEstado(page).click();
        await esperarCargaOverlay(page).catch(() => {});
    };
    fn.displayName = 'Toggle slider de estado de conductor';
    return fn;
};
