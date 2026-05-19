import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const IntentarAgregarSinSelectores = (item: ItemVenta) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Intentar agregar sin completar selectores obligatorios
        await page.getByRole('button', {name: 'Agregar a venta'}).click();
    };
    fn.displayName = 'Intentar agregar sin selectores';
    return fn;
};
