import {type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

export const AbrirMenuDescargas = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnOpcionesGenerales(page).click();
    };
    fn.displayName = 'Abrir menú de opciones generales (Descargas)';
    return fn;
};

export const DescargarClientesFiltrados = () => {
    const fn = async (page: Page): Promise<void> => {
        const downloadPromise = page.waitForEvent('download');
        await ClientesTargets.opcionDescargarFiltrados(page).click();
        const download = await downloadPromise;
        // The download object is handled by playwright, we just wait for it.
        // We could also assert the filename ends with .xlsx if needed.
    };
    fn.displayName = 'Descargar clientes filtrados';
    return fn;
};

export const DescargarTodosLosClientes = () => {
    const fn = async (page: Page): Promise<void> => {
        const downloadPromise = page.waitForEvent('download');
        await ClientesTargets.opcionDescargarTodos(page).click();
        const download = await downloadPromise;
    };
    fn.displayName = 'Descargar todos los clientes';
    return fn;
};
