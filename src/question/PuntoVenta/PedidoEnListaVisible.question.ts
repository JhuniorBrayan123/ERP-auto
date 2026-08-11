import { type Page } from '@playwright/test';

export const PedidoEnListaVisible = (numPedido: string) =>
    async (page: Page): Promise<boolean> => {
        try {

            const locator = page.getByText(`PD01-${numPedido}`, { exact: true }).first();
            await locator.waitFor({ state: 'visible', timeout: 10_000 });
            return true;
        } catch {
            return false;
        }
    };