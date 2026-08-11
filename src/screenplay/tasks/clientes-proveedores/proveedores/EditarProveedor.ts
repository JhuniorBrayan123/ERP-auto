import {type Page} from '@playwright/test';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

export const EditarNombreProveedor = (nuevoNombre: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.inputRazonSocial(page).click();
        await ProveedoresTargets.inputRazonSocial(page).fill(nuevoNombre);
    };
    fn.displayName = `Editar nombre de proveedor: ${nuevoNombre}`;
    return fn;
};

export const CambiarEstadoProveedorEnFormulario = (estado: 'Activo' | 'Inactivo') => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.selectEstadoEnFormulario(page).click();
        await ProveedoresTargets.opcionEstadoFormulario(page, estado).click();
    };
    fn.displayName = `Cambiar estado en formulario a: ${estado}`;
    return fn;
};

export const ClickGuardarCambiosProveedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.btnGuardarCambios(page).click();
    };
    fn.displayName = 'Click en Guardar cambios';
    return fn;
};

export const CancelarCreacion = () => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.btnCancelarForm(page).click();
        await ProveedoresTargets.btnConfirmarCancelar(page).click();
    };
    fn.displayName = 'Cancelar creación/edición';
    return fn;
};

export const ClickEliminarConfirmar = () => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.btnEliminarConfirmar(page).click();
    };
    fn.displayName = 'Confirmar eliminación de proveedor';
    return fn;
};
