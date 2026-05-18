import {expect, type Page} from '@playwright/test';
import {FUNCTIONAL_CATALOG} from '../../utils/functional-catalog';
import {throwFunctionalError} from '../../utils/functional-error';

export class StockVerificacionPage {
    constructor(private readonly page: Page) {
    }

    async buscarPorCodigo(codigo: string): Promise<void> {
        try {
            const searchInput = this.page.getByRole('textbox', {name: 'Buscar por nombre, código o c'});
            await searchInput.click();
            await searchInput.fill(codigo);
            await expect(this.page.getByRole('table').getByText(codigo).first()).toBeVisible({timeout: 15000});
        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.stock.buscarProducto,
                technicalDetail: `${FUNCTIONAL_CATALOG.stock.buscarProducto.technicalDetail} Código buscado: ${codigo}.`,
                cause: error,
            });
        }
    }

    async clickAlmacenMultiple(): Promise<void> {
        await this.page
            .locator('div')
            .filter({hasText: /^Varios\*$/})
            .first() // Prevenir strict mode violation
            .click();
    }

    async clickAlmacenMultipleEnTabla(): Promise<void> {
        await this.page.getByRole('cell', {name: 'Varios*'}).click();
    }

    async clickAlmacenMultipleNth(index: number): Promise<void> {
        await this.page.getByText('Varios*').nth(index).click();
    }

    async clickVariosTexto(): Promise<void> {
        await this.page.getByText('Varios*').first().click(); // Prevenir strict mode violation
    }

    async clickAlmacenEnTabla(nombre: string): Promise<void> {
        await this.page.getByRole('table').getByText(nombre).click();
    }

    async clickStockComprometido(): Promise<void> {
        await this.page.getByText('Stock comprometido').click();
    }

    async clickFlechaExpandir(): Promise<void> {
        await this.page.locator('.arrow').click();
    }

    async clickVariante(nombre: string): Promise<void> {
        await this.page.getByText(nombre).click();
    }

    async abrirKardexDesdeStock(codigo?: string): Promise<Page> {
        try {
            const popupPromise = this.page.waitForEvent('popup');
            if (codigo) {
                await this.page.getByRole('row', { name: new RegExp(codigo, 'i') })
                    .getByRole('button', {name: 'Ver Kardex'}).first().click();
            } else {
                await this.page.getByRole('button', {name: 'Ver Kardex'}).first().click();
            }
            const kardexPage = await popupPromise;
            await kardexPage.waitForLoadState('domcontentloaded');
            await kardexPage.waitForURL(/kardex/i, {timeout: 15_000});

            const overload = kardexPage.locator('.cmp-overload');
            await overload.waitFor({state: 'hidden', timeout: 15_000}).catch(() => {
            });
            await kardexPage.locator('.cmp-cards-almacen').first().waitFor({
                state: 'visible',
                timeout: 15_000,
            });

            return kardexPage;
        } catch (error) {
            return await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.stock.abrirKardex,
                cause: error,
            });
        }
    }

    async abrirKardexPorAlmacen(nombreAlmacen: string): Promise<Page> {
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('row').filter({hasText: new RegExp(nombreAlmacen, 'i')}).getByRole('button', {name: 'Ver Kardex'}).first().click();
        return popupPromise;
    }

    async abrirKardexVariante(rowName: string): Promise<Page> {
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('row', {name: rowName}).getByRole('button').click();
        return popupPromise;
    }
}
