import { type Page } from '@playwright/test';

/**
 * Interaction compartida: llenar campo de observaciones en cotización o pedido.
 */
export const LlenarObservaciones = (texto: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = page.getByRole('textbox', { name: 'Ingresa tus observaciones' });
        await input.click();
        await input.fill(texto);
    };
    fn.displayName = `Llenar observaciones: ${texto.substring(0, 40)}...`;
    return fn;
};
