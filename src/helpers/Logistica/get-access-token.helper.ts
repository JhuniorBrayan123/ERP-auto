import type { Page } from '@playwright/test';

/**
 * Extrae el AccessToken almacenado en localStorage del navegador.
 *
 * Prerequisito: el usuario ya debe haber iniciado sesión (storageState cargado).
 *
 * @param page - Instancia de Page de Playwright con sesión activa.
 * @returns El token JWT como string.
 * @throws Error si el token no existe en localStorage.
 *
 * @example
 * ```ts
 * const token = await getAccessToken(page);
 * const api = new KardexApi(request, token);
 * ```
 */
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
