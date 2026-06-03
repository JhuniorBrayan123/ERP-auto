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
