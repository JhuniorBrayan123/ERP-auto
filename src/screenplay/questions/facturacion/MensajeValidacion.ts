import {type Page} from '@playwright/test';

export const MensajeValidacion = (pattern?: string | RegExp) => {
    const fn = async (page: Page): Promise<string> => {
        const locator = pattern
            ? page.getByText(pattern)
            : page.locator('.v-modal .messages .v-text, .v-alert, .alert-message, [class*="error"], .v-toast').first();

        const texto = await locator.textContent({timeout: 8_000}).catch(() => 'Error en MensajeValidacion');
        return texto?.trim() ?? '';
    };
    fn.displayName = 'Leer mensaje de validación del sistema';
    return fn;
};