import {expect, type Page} from '@playwright/test';
import {ClientesTargets} from '@screenplay/targets/clientes-proveedores/ClientesTargets';

export const AbrirConfiguracionColumnas = () => {
    const fn = async (page: Page): Promise<void> => {
        await ClientesTargets.btnAnadirCampos(page).click();
    };
    fn.displayName = 'Abrir configuración de columnas';
    return fn;
};

export const ToggleColumnaVisible = (nombreColumna: string, accion: 'mostrar' | 'ocultar') => {
    const fn = async (page: Page): Promise<void> => {
        const checkbox = ClientesTargets.checkboxInputColumna(page, nombreColumna);
        const estaVisible = await checkbox.isChecked();

        if (accion === 'ocultar' && estaVisible) {
            await ClientesTargets.checkboxColumna(page, nombreColumna).click();
            await expect(checkbox).not.toBeChecked();
        }

        if (accion === 'mostrar' && !estaVisible) {
            await ClientesTargets.checkboxColumna(page, nombreColumna).click();
            await expect(checkbox).toBeChecked();
        }
    };
    fn.displayName = `Toggle visibilidad de columna: ${nombreColumna} (${accion})`;
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
