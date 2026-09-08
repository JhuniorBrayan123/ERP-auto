import {type Page} from '@playwright/test';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';
import {esperarCargaOverlaySiVisible} from '@utils/wait-helpers';
import {generarConductorDNI} from "@data/clientes-proveedores/conductores.data";

export const ToggleSliderEstadoConductor = (_accion?: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ConductoresTargets.sliderEstado(page).click();
        await esperarCargaOverlaySiVisible(page);
        await ConductoresTargets.botonContextualConductor(page).click();
    };
    fn.displayName = 'Toggle slider de estado de conductor';
    return fn;
};
