import {expect, Locator, Page, Response} from '@playwright/test';

export const esperarCargaOverlay = async (
    page: Page,
    timeout = 35_000
): Promise<void> => {
    const overlay = page.locator('[id="cmn_cmp-overload:loading"]');
    await expect(overlay).toBeHidden({ timeout });
    await page.waitForTimeout(300);
    await expect(overlay).toBeHidden({ timeout: 5_000 });
};
export const esperarDebounce = async (
    page: Page,
    ms: number = 500,
    razon: string
): Promise<void> => {
    await page.waitForTimeout(ms);
};

/**
 * Recarga la página y espera a que esté estable (overlay oculto + networkidle).
 * Útil después de clickNuevaVenta cuando el servidor puede devolver un error 500 intermitente.
 */
export const recargarSiHayError = async (
    page: Page,
    options?: { timeout?: number }
): Promise<void> => {
    const timeout = options?.timeout ?? 60_000;
    console.log('   Recargando página para recuperar de posible error 500...');

    await page.reload({ waitUntil: 'networkidle', timeout });

    const overlay = page.locator('[id="cmn_cmp-overload:loading"]');
    await overlay.waitFor({ state: 'hidden', timeout: 35_000 }).catch(() => {});

    console.log('   Página recargada y estable.');
};
