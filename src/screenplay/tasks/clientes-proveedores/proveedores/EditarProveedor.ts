import {type Page} from '@playwright/test';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

export const ClickGuardarCambiosProveedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.btnGuardarCambios(page).click();
    };
    fn.displayName = 'Click Guardar cambios';
    return fn;
};

export const EditarNombreProveedor = (nuevoNombre: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ProveedoresTargets.inputNombreRazonSocial(page);
        await input.click();
        await input.fill(nuevoNombre);
    };
    fn.displayName = `Editar nombre: ${nuevoNombre}`;
    return fn;
};

export const CambiarEstadoProveedorEnFormulario = (estado: 'Activo' | 'Inactivo') => {
    const fn = async (page: Page): Promise<void> => {
        if (estado === 'Inactivo') {
            await ProveedoresTargets.estadoActivo(page).click();
            await ProveedoresTargets.estadoInactivo(page).click();
        } else {
            await ProveedoresTargets.estadoInactivo(page).click();
            await ProveedoresTargets.estadoActivo(page).click();
        }
    };
    fn.displayName = `Cambiar estado a: ${estado}`;
    return fn;
};
