import {expect, type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

export const ClickGuardarCambios = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnGuardarCambios(page).click();
    };
    fn.displayName = 'Click en Guardar cambios';
    return fn;
};

export const EditarNombreCliente = (nuevoNombre: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ClientesTargets.inputNombreRazonSocial(page);
        await input.click();
        await input.fill(nuevoNombre);
    };
    fn.displayName = `Editar nombre cliente: ${nuevoNombre}`;
    return fn;
};

export const EditarCampoAdicional = (nombreCampo: string, valor: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ClientesTargets.inputCampoAdicionalCreado(page, nombreCampo);
        await input.click();
        await input.fill(valor);
    };
    fn.displayName = `Editar campo adicional: ${nombreCampo}=${valor}`;
    return fn;
};

export const CambiarEstadoClienteEnFormulario = (estado: 'Activo' | 'Inactivo') => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.estadoSelect(page).click();

        if (estado === 'Inactivo') {
            await ClientesTargets.estadoInactivo(page).click();
        } else {
            await ClientesTargets.estadoActivo(page).click();
        }
    };
    fn.displayName = `Cambiar estado a: ${estado}`;
    return fn;
};

export const EliminarCampoAdicionalEnFormulario = (nombreCampo: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnEliminarCampoAdicional(page, nombreCampo).click();
        await ClientesTargets.btnConfirmarEliminarCampo(page).click();
    };
    fn.displayName = `Eliminar campo adicional: ${nombreCampo}`;
    return fn;
};
