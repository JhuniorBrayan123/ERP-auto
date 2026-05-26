import { type Page } from '@playwright/test';

export const PedidoEnListaVisible = (numPedido: string) =>
    async (page: Page): Promise<boolean> => {
        try {
            // getByText busca el elemento más interno con ese texto exacto,
            // no el div ancestro. Esto evita el .first() trampa.
            const locator = page.getByText(`PD01-${numPedido}`, { exact: true }).first();
            await locator.waitFor({ state: 'visible', timeout: 10_000 });
            return true;
        } catch {
            return false;
        }
    };