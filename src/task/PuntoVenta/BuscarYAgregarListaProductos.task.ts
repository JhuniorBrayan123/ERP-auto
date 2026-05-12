import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const BuscarYAgregarListaProductos = (item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Seleccionar un item dentro de la lista e incrementar
        await page.locator('div').filter({hasText: /^item para combos gravado flexible\(\+S\/10\.00\)$/}).first().click();
        await page.locator('[id="_div:increase"]').first().click();
        await page.getByRole('button', {name: 'Agregar a venta'}).click();
    };
