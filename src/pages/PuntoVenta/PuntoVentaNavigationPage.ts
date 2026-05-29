import { expect, type Page } from '@playwright/test';
import { throwFunctionalError } from '../../utils/functional-error';
import { FUNCTIONAL_CATALOG } from '../../utils/functional-catalog';

export class PuntoVentaNavigationPage {
    constructor(private readonly page: Page) {}

    async navegarAPuntoDeVenta(): Promise<void> {
        try {
            await this.page.getByText('Ventas y compras').click();
            await this.page.getByText('Nueva venta', { exact: true }).click();

            const overload = this.page.locator('[id="cmn_cmp-overload:loading"]');
            await overload.waitFor({ state: 'visible', timeout: 3_000 }).catch(() => {});
            await overload.waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.navegarAPdV,
                cause: error,
            });
        }
    }

    async continuarVendiendo(): Promise<void> {
        await this.page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    }

    async salirDeCaja(): Promise<void> {
        await this.page.locator('.v-icon-back .icon').click();
    }

    async navegarABusquedaComprobantes(): Promise<void> {
        await this.salirDeCaja();
        await this.page.getByText('Ventas y compras').click();
        await this.page.getByText('Búsqueda de comprobantes').click();
    }

    async navegarAStockProductos(): Promise<void> {
        await this.page.getByText('Productos y servicios').click();
        await this.page.getByText('Stock de productos').click();
    }

    async navegarAKardexTotal(): Promise<void> {
        await this.page.getByText('Productos y servicios').click();
        await this.page.getByText('Kardex total').click();
    }

    async volverAPuntoDeVenta(): Promise<void> {
        await this.page.locator('.v-icon-back > .icon').click();
        await this.page.getByText('Ventas y compras').click();
        await this.page.getByText('Nueva venta', { exact: true }).click();
    }
}
