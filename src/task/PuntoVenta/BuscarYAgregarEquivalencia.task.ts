import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const BuscarYAgregarEquivalencia = (item: ItemVenta, equivalencia: string) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Seleccionar equivalencia
        await page.getByText(equivalencia).click();
        await page.locator('.cmp-informacion-item > div').first().click();
    };
