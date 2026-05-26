import {type Page} from '@playwright/test';

export const ActualizarPedido = () => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByRole('button', { name: 'ACTUALIZAR PEDIDO' }).click();
    };
    fn.displayName = 'Actualizar pedido';
    return fn;
};
