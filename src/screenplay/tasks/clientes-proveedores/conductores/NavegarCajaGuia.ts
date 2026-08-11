import {Page} from "@playwright/test";

export const ContinuarCajaDeVenta = (nombreCaja: string = 'Caja de venta') => {
    const fn = async (page: Page): Promise<void> => {
        const tarjetaCaja = page.locator('.detalle')
            .filter({has: page.locator('.v-text', {hasText: nombreCaja})})
            .first();

        await tarjetaCaja.waitFor({state: 'attached', timeout: 20_000});
        await tarjetaCaja.scrollIntoViewIfNeeded({timeout: 15_000}).catch(() => {
        });

        await tarjetaCaja.getByRole('button', {name: 'Continuar vendiendo'}).click();

    };
    fn.displayName = 'Continuar Caja de Venta';
    return fn;
};