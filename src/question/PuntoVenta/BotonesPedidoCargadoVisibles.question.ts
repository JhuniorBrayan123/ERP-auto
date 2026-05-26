import {type Page} from '@playwright/test';

export const BotonesPedidoCargadoVisibles = () =>
    async (page: Page): Promise<boolean> => {
        try {
            await page.getByRole('button', { name: 'GUARDAR NUEVO PEDIDO' }).waitFor({ state: 'visible', timeout: 5000 });
            await page.getByRole('button', { name: 'ACTUALIZAR PEDIDO' }).waitFor({ state: 'visible', timeout: 5000 });
            await page.getByRole('button', { name: 'PAGAR PEDIDO' }).waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    };
