import { type Page } from '@playwright/test';

export const MensajeExito = (timeout: number = 15_000) => {
    const fn = async (page: Page): Promise<boolean> => {
        return await page.getByText('¡Buen trabajo!').isVisible({ timeout }).catch(() => false);
    };
    fn.displayName = '¿Mensaje de éxito visible?';
    return fn;
};
