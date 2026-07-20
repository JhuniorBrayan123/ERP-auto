import {expect, type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';
import {AbrirAccionContextualCliente, BuscarClienteEnListado} from './BuscarCliente';

export const EliminarCliente = (numeroDocumento: string) => {
    const fn = async (page: Page): Promise<void> => {
        await BuscarClienteEnListado(numeroDocumento)(page);

        await AbrirAccionContextualCliente('Eliminar cliente')(page);

        await ClientesTargets.btnConfirmarEliminar(page).click();

        await expect(ClientesTargets.mensajeBuenTrabajo(page)).toBeVisible({timeout: 10_000});
        await expect(ClientesTargets.mensajeExitoEliminacion(page)).toBeVisible();

        await ClientesTargets.btnCerrarModal(page).click();
        await page.waitForTimeout(500);
    };
    fn.displayName = `Eliminar Cliente — ${numeroDocumento}`;
    return fn;
};

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
