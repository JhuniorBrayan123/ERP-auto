import {type Page} from '@playwright/test';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

export const AbrirMenuDescargasProveedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.btnOpcionesGenerales(page).click();
    };
    fn.displayName = 'Abrir menú de opciones generales (Descargas Proveedor)';
    return fn;
};

export const DescargarProveedoresFiltrados = () => {
    const fn = async (page: Page): Promise<void> => {
        const downloadPromise = page.waitForEvent('download');
        await ProveedoresTargets.opcionDescargarFiltrados(page).click();
        const download = await downloadPromise;
    };
    fn.displayName = 'Descargar proveedores filtrados';
    return fn;
};

export const DescargarTodosLosProveedores = () => {
    const fn = async (page: Page): Promise<void> => {
        const downloadPromise = page.waitForEvent('download');
        await ProveedoresTargets.opcionDescargarTodos(page).click();
        const download = await downloadPromise;
    };
    fn.displayName = 'Descargar todos los proveedores';
    return fn;
};
