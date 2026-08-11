import { Page } from '@playwright/test';

export const ClickAceptarModal = () => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByRole('button', { name: 'Aceptar' }).click();
    };
    fn.displayName = 'Cerrar modal Aceptar';
    return fn;
};
