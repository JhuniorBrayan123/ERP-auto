import {type Page} from '@playwright/test';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';

export const IntentarDescargarPdf = () => {
    const fn = async (page: Page): Promise<void> => {
        const postEmision = new PostEmisionPage(page);
        await postEmision.clickDescargarPDF();
    };
    fn.displayName = 'Intentar descargar PDF';
    return fn;
};
