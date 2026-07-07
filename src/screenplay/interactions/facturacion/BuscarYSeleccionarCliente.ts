import { expect, type Page } from '@playwright/test';
import { esperarDebounce } from '@utils/wait-helpers';
import type { DatosCliente } from '@helpers/PuntoVenta/emision.types';

export const BuscarYSeleccionarCliente = (
    cliente: DatosCliente & { textoSelector?: string }
) => {
    const fn = async (page: Page): Promise<void> => {
        const input = page.getByRole('textbox', { name: 'Digita RUC o razón social' });
        await expect(input).toBeVisible({ timeout: 10_000 });
        await input.click();
        await input.fill(cliente.documento);
        await esperarDebounce(page, 700, 'Debounce buscador cliente Vista Facturación');

        const selector = cliente.textoSelector ?? cliente.nombre;
        await page.getByText(selector).click();
    };
    fn.displayName = `Seleccionar cliente: ${cliente.nombre} (${cliente.documento})`;
    return fn;
};
