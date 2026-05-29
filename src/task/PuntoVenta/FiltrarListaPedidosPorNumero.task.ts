import {type Page} from '@playwright/test';

export const FiltrarListaPedidosPorNumero = (numero: string) => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByText('N° de pedido').click();
        const input = page.getByRole('textbox', { name: 'N° de pedido' });
        await input.click();
        await input.fill(numero);
        await page.waitForTimeout(800);
    };
    fn.displayName = `Filtrar pedidos por número: ${numero}`;
    return fn;
};
