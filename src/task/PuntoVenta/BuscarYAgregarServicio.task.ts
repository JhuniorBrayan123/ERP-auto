// SC-07: Continuar vendiendo → buscar servicio → seleccionar desde grilla
import { Page } from '@playwright/test';
import { EmisionPage } from '../../pages/PuntoVenta/EmisionPage';

export const BuscarYAgregarServicio = (busqueda: string) =>
    async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
        await emision.buscarItem(busqueda);
        await page.locator('.image-default').first().click();
    };
