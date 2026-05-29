import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const IntentarPrecioInvalido = (item: ItemVenta, precioInvalido: string) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        
        await emision.editarPrecioItem(precioInvalido);
        
        await emision.clickPagar();
    };
    fn.displayName = 'Intentar precio inválido';
    return fn;
};
