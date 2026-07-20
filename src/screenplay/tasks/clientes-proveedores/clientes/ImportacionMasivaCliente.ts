import {type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';
import path from 'path';

export const AbrirImportacionMasiva = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnOpcionesGenerales(page).click();
        await ClientesTargets.opcionCrearDesdeExcel(page).click();
        await ClientesTargets.btnCerrarPopup(page).click();
        await page.getByText('Clientes', {exact: true}).click();
        await ClientesTargets.btnSiguiente(page).click();
    };
    fn.displayName = 'Abrir modal de importación masiva';
    return fn;
};

export const SubirArchivoExcel = (nombreArchivo: string) => {
    const fn = async (page: Page): Promise<void> => {
        const filePath = path.resolve(process.cwd(), 'src/data', nombreArchivo);
        await ClientesTargets.btnSeleccionarArchivo(page).setInputFiles(filePath);
        await ClientesTargets.btnSiguiente(page).click();
    };
    fn.displayName = `Subir archivo Excel: ${nombreArchivo}`;
    return fn;
};

export const ProcesarImportacion = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnProcesarExcel(page).click();
    };
    fn.displayName = 'Procesar archivo Excel subido';
    return fn;
};

export const FinalizarImportacionVolverInicio = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnIrAlInicio(page).click();
    };
    fn.displayName = 'Finalizar importación y volver al inicio';
    return fn;
};

export const EliminarMasivamente = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.checkboxSeleccionarTodo(page).click({force: true});
        await ClientesTargets.btnAccionesMasivas(page).click();
        await ClientesTargets.opcionEliminarClientesMasivo(page).click();
        await page.getByRole('button', {name: 'Eliminar'}).click();
    };
    fn.displayName = 'Eliminar masivamente clientes seleccionados';
    return fn;
};
