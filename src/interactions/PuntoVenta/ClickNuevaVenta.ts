import { type Page } from '@playwright/test';
import { PostEmisionPage } from '@pages/PuntoVenta/PostEmisionPage';

export const ClickNuevaVenta = () => {
    const fn = async (page: Page): Promise<void> => {
        const postEmisionPage = new PostEmisionPage(page);
        await postEmisionPage.clickNuevaVenta();
    };
    fn.displayName = `Click Nueva Venta`;
    return fn;
};
