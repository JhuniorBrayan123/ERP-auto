import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const BuscarYAgregarListaProductos = (item: ItemVenta) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        
        
        await page.locator('[id="_div:increase"] > .simbolo-mas').first().click();
        await page.getByRole('button', {name: 'Agregar a venta'}).click();
    };
    fn.displayName = 'Buscar y agregar lista de productos';
    return fn;
};

