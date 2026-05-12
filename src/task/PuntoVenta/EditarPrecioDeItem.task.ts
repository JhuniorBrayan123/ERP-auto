import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const EditarPrecioDeItem = (item: ItemVenta, nuevoPrecio: string) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Editar precio — delega a EmisionPage POM
        await emision.editarPrecioItem(nuevoPrecio);
    };
