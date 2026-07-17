import {type Page} from '@playwright/test';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

export const ClickGuardarCambiosConductor = () => {
    const fn = async (page: Page): Promise<void> => { await ConductoresTargets.btnGuardarCambios(page).click(); };
    fn.displayName = 'Click Guardar cambios';
    return fn;
};

export const EditarNombreConductor = (nuevoNombre: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ConductoresTargets.inputNombreRazonSocial(page);
        await input.click();
        await input.fill(nuevoNombre);
    };
    fn.displayName = `Editar nombre: ${nuevoNombre}`;
    return fn;
};

export const CambiarEstadoConductorEnFormulario = (estado: 'Activo' | 'Inactivo') => {
    const fn = async (page: Page): Promise<void> => {
        if (estado === 'Inactivo') {
            await ConductoresTargets.estadoActivo(page).click();
            await ConductoresTargets.estadoInactivo(page).click();
        } else {
            await ConductoresTargets.estadoInactivo(page).click();
            await ConductoresTargets.estadoActivo(page).click();
        }
    };
    fn.displayName = `Cambiar estado a: ${estado}`;
    return fn;
};
