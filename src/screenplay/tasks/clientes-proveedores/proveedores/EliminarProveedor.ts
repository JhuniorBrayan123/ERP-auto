import {type Page} from '@playwright/test';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

export const ClickEliminarConfirmarProveedor = () => {
    const fn = async (page: Page): Promise<void> => { await ProveedoresTargets.btnConfirmarEliminar(page).click(); };
    fn.displayName = 'Confirmar eliminación';
    return fn;
};

export const ClickCancelarProveedor = () => {
    const fn = async (page: Page): Promise<void> => { await ProveedoresTargets.btnCancelar(page).click(); };
    fn.displayName = 'Click Cancelar';
    return fn;
};

export const ClickAceptarErrorProveedor = () => {
    const fn = async (page: Page): Promise<void> => { await ProveedoresTargets.btnAceptarError(page).click(); };
    fn.displayName = 'Click Aceptar (error)';
    return fn;
};
