import {type Page} from '@playwright/test';
import {PosTargets} from '@screenplay/targets/cross-modules/PosTargets';
import {esperarCargaOverlaySiVisible} from "@utils/wait-helpers";

export const GuardarDatosVenta = () => {
    const fn = async (page: Page): Promise<void> => {
        await PosTargets.btnGuardarDatosVenta(page).click();
        await esperarCargaOverlaySiVisible(page);
    };
    fn.displayName = 'Guardar datos de venta';
    return fn;
};