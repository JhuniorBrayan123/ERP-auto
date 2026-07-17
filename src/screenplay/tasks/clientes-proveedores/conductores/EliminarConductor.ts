import {type Page} from '@playwright/test';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

export const ClickEliminarConfirmarConductor = () => {
    const fn = async (page: Page): Promise<void> => { await ConductoresTargets.btnConfirmarEliminar(page).click(); };
    fn.displayName = 'Confirmar eliminación';
    return fn;
};

export const ClickCancelarConductor = () => {
    const fn = async (page: Page): Promise<void> => { await ConductoresTargets.btnCancelar(page).click(); };
    fn.displayName = 'Click Cancelar';
    return fn;
};

export const ClickAceptarErrorConductor = () => {
    const fn = async (page: Page): Promise<void> => { await ConductoresTargets.btnAceptarError(page).click(); };
    fn.displayName = 'Click Aceptar (error)';
    return fn;
};
