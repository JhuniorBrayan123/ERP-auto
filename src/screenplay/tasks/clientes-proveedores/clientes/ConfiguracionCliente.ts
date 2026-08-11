import {expect, type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

export const AbrirConfiguracionColumnas = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnAñadirCampos(page).click();
    };
    fn.displayName = 'Abrir configuración de columnas';
    return fn;
};

export const ToggleColumnaVisible = (nombreColumna: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.checkboxColumna(page, nombreColumna).click();
    };
    fn.displayName = `Toggle visibilidad de columna: ${nombreColumna}`;
    return fn;
};

export const GuardarConfiguracionColumnas = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnGuardarCambios(page).click();
    };
    fn.displayName = 'Guardar cambios de columnas';
    return fn;
};

export const ValidarColumnaObligatoria = (nombreColumna: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ClientesTargets.etiquetaCampoObligatorio(page, nombreColumna)).toBeVisible();
    };
    fn.displayName = `Validar que columna es obligatoria: ${nombreColumna}`;
    return fn;
};
