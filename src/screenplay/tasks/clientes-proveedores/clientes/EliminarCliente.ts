import {type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

export const ClickEliminarConfirmar = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnConfirmarEliminar(page).click();
    };
    fn.displayName = 'Confirmar eliminación';
    return fn;
};

export const ClickCancelar = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnCancelar(page).click();
    };
    fn.displayName = 'Click Cancelar';
    return fn;
};

export const ClickSiCancelar = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnConfirmarCancelar(page).click();
    };
    fn.displayName = 'Click Sí, cancelar';
    return fn;
};

export const ClickAceptarError = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnAceptarError(page).click();
    };
    fn.displayName = 'Click Aceptar (error)';
    return fn;
};
