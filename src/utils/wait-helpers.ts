import {Locator, Page, Response} from '@playwright/test';

/**
 * Helpers centralizados para estrategias de espera (Waits) en Playwright.
 * Objetivo: Eliminar waitForTimeout explícitos (flakiness) y usar eventos reales.
 */

/**
 * Espera dinámicamente a que el overlay/spinner de carga general del ERP desaparezca.
 * Reemplaza el uso de `waitForTimeout` tras navegaciones o acciones pesadas.
 *
 * @param page Instancia de la página de Playwright.
 * @param timeout Tiempo máximo de espera en ms (default: 35000).
 */
export const esperarCargaOverlay = async (page: Page, timeout = 35_000): Promise<void> => {
    await page.locator('[id="cmn_cmp-overload:loading"]')
        .waitFor({state: 'hidden', timeout})
        .catch(() => {});
};

/**
 * Wrapper de waitForTimeout para centralizar su uso y limitarlo a casos justificados.
 * SOLO debe usarse cuando el sistema tiene un comportamiento de "debounce" inherente
 * que no dispara eventos de red ni cambios inmediatos en el DOM.
 *
 * @param page Instancia de la página de Playwright.
 * @param ms Milisegundos a esperar (default: 500).
 * @param razon Obligatorio documentar por qué se necesita este tiempo arbitrario.
 */
export const esperarDebounce = async (
    page: Page,
    ms: number = 500,
    razon: string
): Promise<void> => {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(ms);
};
