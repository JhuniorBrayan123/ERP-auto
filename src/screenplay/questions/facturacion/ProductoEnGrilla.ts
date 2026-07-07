import { type Page } from '@playwright/test';
import { VentaGridTargets } from '@screenplay/targets/facturacion/VentaGridTargets';

export const ProductoEnGrilla = (nombreProducto: string) => {
    const fn = async (page: Page): Promise<boolean> => {
        const tabla = VentaGridTargets.tablaGrilla(page);
        return await tabla.getByText(nombreProducto, { exact: false }).isVisible({ timeout: 5_000 }).catch(() => false);
    };
    fn.displayName = `¿Producto "${nombreProducto}" está en la grilla?`;
    return fn;
};
