import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const BuscarYAgregarVariante = (item: ItemVenta) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        
        await page.getByText('Seleccionar').first().click();
        await page.getByText('Variante 2 flexible').click();
        await page.getByText('Variante 3 flexible').click();
        
        await page.locator('.cmp-informacion-item > div').first().click();
    };
    fn.displayName = 'Buscar y agregar variante';
    return fn;
};
