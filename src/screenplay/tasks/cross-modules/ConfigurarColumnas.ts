import {type Page} from '@playwright/test';

export const AbrirConfiguracionColumnas = () => {
    const fn = async (page: Page): Promise<void> => {
        await page.locator('.v-icon-head-plus > .icon').click();
    };
    fn.displayName = 'Abrir configuración de columnas';
    return fn;
};

export const SeleccionarColumna = (nombreColumna: string) => {
    const fn = async (page: Page): Promise<void> => {
        // En el codegen selecciona basándose en nth, pero podemos buscar por label
        // Normalmente el texto de la columna está en el label
        const checkbox = page.locator('label').filter({hasText: nombreColumna}).locator('span').first();
        if (await checkbox.isVisible()) {
            await checkbox.click();
        } else {
            // Fallback genérico del codegen
            await page.locator('.v-checkbox-grid-label > span').first().click();
            await page.locator('div:nth-child(8) > .text > .v-checkbox > .v-checkbox-base > .v-checkbox-grid-label > span').click();
        }
    };
    fn.displayName = `Seleccionar columna: ${nombreColumna}`;
    return fn;
};

export const GuardarConfiguracionColumnas = () => {
    const fn = async (page: Page): Promise<void> => {
        const btnGuardar = page.getByRole('button', {name: 'Guardar cambios'});
        if (await btnGuardar.isVisible()) {
            await btnGuardar.click();
        }
    };
    fn.displayName = 'Guardar configuración de columnas';
    return fn;
};
