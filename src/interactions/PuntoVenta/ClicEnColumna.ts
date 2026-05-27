import {type Page} from '@playwright/test';

/**
 * Hace clic en el encabezado de una columna visible por su texto exacto.
 * Útil para cambiar ordenamiento o forzar actualización de la grilla.
 *
 * Ej: ClicEnColumna('Cliente') → hace clic en el header "Cliente"
 */
export const ClicEnColumna = (nombreColumna: string) => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByText(nombreColumna, {exact: true}).click();
    };
    fn.displayName = `Clic en columna "${nombreColumna}"`;
    return fn;
};
