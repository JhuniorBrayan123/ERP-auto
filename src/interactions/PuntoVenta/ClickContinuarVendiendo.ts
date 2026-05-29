import { Page } from '@playwright/test';

export const ClickContinuarVendiendo = () => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    };
    fn.displayName = 'Continuar vendiendo';
    return fn;
};
