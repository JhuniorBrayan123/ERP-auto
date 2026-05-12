// SC-08: Continuar vendiendo → buscar receta → seleccionar desde grilla
import { Page } from '@playwright/test';
import { EmisionPage } from '../../pages/PuntoVenta/EmisionPage';
import type { ItemVenta } from '../../helpers/PuntoVenta/emision.types';

export const BuscarYAgregarReceta = (item: ItemVenta) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
        await emision.buscarItem(item.codigo);
        await page.locator('.image-default').first().click();
    };
