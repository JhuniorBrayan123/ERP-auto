import {expect, Page} from '@playwright/test';

export const esperarCargaOverlay = async (
    page: Page,
    timeout = 35_000
): Promise<void> => {
    const overlay = page.locator('[id="cmn_cmp-overload:loading"]');
    await overlay.waitFor({state: 'visible', timeout: 15_000}).catch(() => {});
    await overlay.waitFor({state: 'hidden', timeout});

    await page.waitForTimeout(300);

    await overlay.waitFor({state: 'hidden', timeout: 7_000}).catch(() => {});
};

/**
 * Variante de `esperarCargaOverlay` para contextos donde el overlay global
 * `cmn_cmp-overload:loading` NO suele aparecer (p.ej. popups/ventanas nuevas
 * como Ver Comprobante). A diferencia de la versión original, que espera hasta
 * 15s a que el overlay se vuelva visible (y quema ese tiempo si nunca aparece),
 * esta variante primero verifica si el overlay está visible con un timeout
 * corto: solo si ya está visible espera a que se oculte; si no está visible,
 * retorna de inmediato (no hay carga pendiente o ya terminó).
 */
export const esperarCargaOverlaySiVisible = async (
    page: Page,
    timeout = 35_000
): Promise<void> => {
    const overlay = page.locator('[id="cmn_cmp-overload:loading"]');
    const visible = await overlay.isVisible({timeout: 500}).catch(() => false);
    if (!visible) {
        return;
    }

    await overlay.waitFor({state: 'hidden', timeout});
    await page.waitForTimeout(300);
    await overlay.waitFor({state: 'hidden', timeout: 7_000}).catch(() => {});
};
export const recargarSiHayError = async (
    page: Page,
    options?: { timeout?: number }
): Promise<void> => {
    const timeout = options?.timeout ?? 60_000;
    console.log('   Recargando página para recuperar de posible error 500...');

    await page.reload({waitUntil: 'networkidle', timeout});

    const overlay = page.locator('[id="cmn_cmp-overload:loading"]');
    await overlay.waitFor({state: 'hidden', timeout: 35_000}).catch(() => {
    });

    console.log('   Página recargada y estable.');
};
export const esperarDebounce = async (
    page: Page,
    ms: number = 500,
    razon: string
): Promise<void> => {
    await page.waitForTimeout(ms);
};