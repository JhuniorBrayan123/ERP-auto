import type { Page } from '@playwright/test';

export async function getAccessToken(page: Page): Promise<string> {
    const token = await page.evaluate(() => localStorage.getItem('AccessToken'));

    if (!token) {
        throw new Error(
            'getAccessToken: No se encontró AccessToken en localStorage. ' +
            'Verifica que el storageState esté configurado y el usuario haya iniciado sesión.',
        );
    }

    return token;
}
