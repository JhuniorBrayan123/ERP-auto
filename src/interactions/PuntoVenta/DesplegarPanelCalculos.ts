import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';

export const DesplegarPanelCalculos = () => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.desplegarPanelCalculos();
    };
    fn.displayName = 'Desplegar panel de cálculos';
    return fn;
};
