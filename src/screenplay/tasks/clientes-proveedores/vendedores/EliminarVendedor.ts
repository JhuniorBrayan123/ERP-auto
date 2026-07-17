import {type Page} from '@playwright/test';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

export const ClickEliminarConfirmarVendedor = () => {
    const fn = async (page: Page): Promise<void> => { await VendedoresTargets.btnConfirmarEliminar(page).click(); };
    fn.displayName = 'Confirmar eliminación';
    return fn;
};

export const ClickCancelarVendedor = () => {
    const fn = async (page: Page): Promise<void> => { await VendedoresTargets.btnCancelar(page).click(); };
    fn.displayName = 'Click Cancelar';
    return fn;
};

export const ClickAceptarErrorVendedor = () => {
    const fn = async (page: Page): Promise<void> => { await VendedoresTargets.btnAceptarError(page).click(); };
    fn.displayName = 'Click Aceptar (error)';
    return fn;
};
