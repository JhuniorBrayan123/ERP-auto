import type { Page } from '@playwright/test';
import { VentaGridTargets } from '@screenplay/targets/facturacion/VentaGridTargets';

export const IncrementarCantidadProducto = (indiceItem = 0, veces = 1) => {
    const fn = async (page: Page): Promise<void> => {
        for (let i = 0; i < veces; i++) {
            await VentaGridTargets.btnIncrementarCantidad(page, indiceItem).click();
        }
    };
    fn.displayName = `Incrementar cantidad del item ${indiceItem} (${veces} vez/veces)`;
    return fn;
};
