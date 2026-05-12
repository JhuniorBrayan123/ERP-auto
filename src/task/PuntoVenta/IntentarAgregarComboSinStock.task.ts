// 📁 src/task/PuntoVenta/IntentarAgregarComboSinStock.task.ts
// SC-16: Buscar combo → clicks repetidos hasta bloqueo por stock de componente
import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const IntentarAgregarComboSinStock = (item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await page.getByRole('button', {name: 'Continuar vendiendo'}).click();
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Clicks repetidos para sobrepasar stock del componente
        await page.getByText(item.nombre).first().dblclick();
        await page.locator('.image-default').dblclick();
    };
