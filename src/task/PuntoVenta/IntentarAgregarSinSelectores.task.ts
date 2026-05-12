// 📁 src/task/PuntoVenta/IntentarAgregarSinSelectores.task.ts
// SC-15: Buscar item con selectores → NO completar obligatorios → intentar agregar
import {Page} from '@playwright/test';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ItemVenta} from '@helpers/PuntoVenta/emision.types';

export const IntentarAgregarSinSelectores = (item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await page.getByText('caja-autoContinuar vendiendo').click();
        await page.getByRole('button', {name: 'Continuar vendiendo'}).click();
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Intentar agregar sin completar selectores obligatorios
        await page.getByRole('button', {name: 'Agregar a venta'}).click();
    };
