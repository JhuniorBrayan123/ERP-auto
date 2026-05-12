// 📁 src/task/PuntoVenta/BuscarYAgregarVariante.task.ts
// SC-11: Buscar item con variante → seleccionar variantes → agregar
import { Page } from '@playwright/test';
import { EmisionPage } from '../../pages/PuntoVenta/EmisionPage';
import type { ItemVenta } from '../../helpers/PuntoVenta/emision.types';

export const BuscarYAgregarVariante = (item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await page.getByText('caja-autoContinuar vendiendo').click();
        await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
        await emision.buscarItem(item.codigo);
        await emision.seleccionarItem(item.nombre);
        // Seleccionar variantes
        await page.getByText('Seleccionar').first().click();
        await page.getByText('Acer (1)').click();
        await page.getByText('Variante 2 flexible').click();
        await page.getByRole('button', { name: 'Limpiar filtros' }).click();
        await page.getByText('Variante 3 flexible').click();
        // Confirmar selección
        await page.locator('.cmp-informacion-item > div').first().click();
    };
