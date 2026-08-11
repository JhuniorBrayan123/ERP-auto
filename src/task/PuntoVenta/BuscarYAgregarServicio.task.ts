import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';

export const BuscarYAgregarServicio = (busqueda: string) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(busqueda);
        await page.locator('.image-default').first().click();
    };
    fn.displayName = 'Buscar y agregar servicio';
    return fn;
};
