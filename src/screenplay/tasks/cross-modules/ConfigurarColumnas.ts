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
        const item = page.locator('.item', {hasText: nombreColumna});
        const estaMarcada = await item.locator('input[type="checkbox"]').isChecked();
        if (!estaMarcada) {
            await item.locator('.v-checkbox-grid-label > span').first().click();
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
