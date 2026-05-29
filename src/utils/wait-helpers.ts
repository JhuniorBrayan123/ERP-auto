import {Locator, Page, Response} from '@playwright/test';

export const esperarCargaOverlay = async (page: Page, timeout = 35_000): Promise<void> => {
    await page.locator('[id="cmn_cmp-overload:loading"]')
        .waitFor({state: 'hidden', timeout})
        .catch(() => {});
};

export const esperarDebounce = async (
    page: Page,
    ms: number = 500,
    razon: string
): Promise<void> => {
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(ms);
};
