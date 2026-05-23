import { expect, type Page } from '@playwright/test';

export const DatosPedidoCargado = {
    contieneReferencia: (textoEsperado: string) => {
        return async (page: Page): Promise<boolean> => {
            try {
                await expect(page.locator('body')).toContainText(textoEsperado, { timeout: 10_000 });
                return true;
            } catch {
                return false;
            }
        };
    },
    contieneMonto: (montoEsperado: string) => {
        return async (page: Page): Promise<boolean> => {
            try {
                await expect(page.locator('body')).toContainText(montoEsperado, { timeout: 10_000 });
                return true;
            } catch {
                return false;
            }
        };
    }
};
