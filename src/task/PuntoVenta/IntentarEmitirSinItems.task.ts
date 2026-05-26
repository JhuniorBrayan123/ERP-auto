import {type Page} from '@playwright/test';
import {EmisionPage} from '../../pages/PuntoVenta/EmisionPage';

export const IntentarEmitirSinItems = () => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.clickPagar();
    };
    fn.displayName = 'Intentar emitir sin ítems';
    return fn;
};
