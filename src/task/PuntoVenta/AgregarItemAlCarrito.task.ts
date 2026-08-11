import { type Page } from '@playwright/test';
import { EmisionPage } from '@pages/PuntoVenta/EmisionPage';
import type { ItemVenta } from '@app-types/emision.types';

export const AgregarItemAlCarrito = (item: ItemVenta) => {
    const fn = async (page: Page): Promise<void> => {
        const emisionPage = new EmisionPage(page);
        await emisionPage.buscarItem(item.codigo);
        await emisionPage.seleccionarItem(item.nombre);
    };
    fn.displayName = `Agregar item al carrito: ${item.nombre}`;
    return fn;
};
