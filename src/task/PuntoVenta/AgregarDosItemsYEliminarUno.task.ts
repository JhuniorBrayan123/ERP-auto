import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

const BTN_CANCELAR = '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-cancelar"]';

export const AgregarDosItemsYEliminarUno = (item1: ItemVenta, item2: ItemVenta, indiceEliminar: number = 1) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        
        await emision.buscarItem(item1.codigo);
        await emision.seleccionarItem(item1.nombre);
        
        const buscador = page.getByRole('textbox', {name: 'Escanea o busca por nombre, c'});
        await buscador.dblclick();
        await buscador.fill(item2.codigo);
        await emision.seleccionarItem(item2.nombre);
        
        await page.locator(BTN_CANCELAR).nth(indiceEliminar).click();
    };
    fn.displayName = 'Agregar dos items y eliminar uno';
    return fn;
};
