import {type Page} from '@playwright/test';

export const ClicEnColumna = (nombreColumna: string) => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByText(nombreColumna, {exact: true}).click();
    };
    fn.displayName = `Clic en columna "${nombreColumna}"`;
    return fn;
};
