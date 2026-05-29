import {expect, type Page} from '@playwright/test';

export const DatosPedidoCargado = {

    contieneItem: (nombreItem: string) => {
        return async (page: Page): Promise<boolean> => {
            try {
                
                const item = page.locator('.cmp-pedido-item').filter({hasText: nombreItem}).first();
                await expect(item).toBeVisible({timeout: 10_000});
                return true;
            } catch {
                return false;
            }
        };
    },

    contieneMontoItem: (precioEsperado: string) => {
        return async (page: Page): Promise<boolean> => {
            try {
                
                const precioLocator = page.locator('.cmp-pedido-item .precio').filter({hasText: precioEsperado}).first();
                await expect(precioLocator).toBeVisible({timeout: 10_000});
                return true;
            } catch {
                return false;
            }
        };
    },

    contieneReferencia: (textoEsperado: string) => {
        return async (page: Page): Promise<boolean> => {
            try {
                const cabecera = page.locator('[id*="cmp-venta-pedido"]').first();
                await expect(cabecera).toContainText(textoEsperado, {timeout: 10_000});
                return true;
            } catch {
                return false;
            }
        };
    }
};