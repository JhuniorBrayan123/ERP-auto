import {type Page} from '@playwright/test';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';

export const IntentarDescargarXml = () => {
    const fn = async (page: Page): Promise<void> => {
        const postEmision = new PostEmisionPage(page);
        await postEmision.clickDescargarXML();
    };
    fn.displayName = 'Intentar descargar XML';
    return fn;
};
