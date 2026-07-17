import {type Page} from '@playwright/test';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

export const ClickGuardarCambiosVendedor = () => {
    const fn = async (page: Page): Promise<void> => { await VendedoresTargets.btnGuardarCambios(page).click(); };
    fn.displayName = 'Click Guardar cambios';
    return fn;
};

export const EditarNombreVendedor = (nuevoNombre: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = VendedoresTargets.inputNombreRazonSocial(page);
        await input.click();
        await input.fill(nuevoNombre);
    };
    fn.displayName = `Editar nombre: ${nuevoNombre}`;
    return fn;
};

export const CambiarEstadoVendedorEnFormulario = (estado: 'Activo' | 'Inactivo') => {
    const fn = async (page: Page): Promise<void> => {
        if (estado === 'Inactivo') {
            await VendedoresTargets.estadoActivo(page).click();
            await VendedoresTargets.estadoInactivo(page).click();
        } else {
            await VendedoresTargets.estadoInactivo(page).click();
            await VendedoresTargets.estadoActivo(page).click();
        }
    };
    fn.displayName = `Cambiar estado a: ${estado}`;
    return fn;
};
