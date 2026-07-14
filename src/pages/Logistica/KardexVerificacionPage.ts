import { expect, type Locator, type Page } from '@playwright/test';
import { FUNCTIONAL_CATALOG } from '../../utils/functional-catalog';
import { throwFunctionalError } from '../../utils/functional-error';

export class KardexVerificacionPage {
    constructor(private readonly page: Page) {
    }

    private readonly overloadLoading = this.page.locator('[id="cmn_cmp-overload:loading"]');

    public async esperarSinOverload(timeout = 35_000): Promise<void> {
        await this.overloadLoading.waitFor({ state: 'hidden', timeout }).catch(() => {
        });
    }

    private verDetalleButtons(): Locator {
        return this.page.getByRole('button', { name: /ver detalle/i });
    }

    private async esperarKardexListo(): Promise<void> {
        await this.page.waitForLoadState('domcontentloaded');

        await this.page.waitForFunction(() => {
            const titulos = document.querySelectorAll('.cmp-cards-almacen .info-almacen .title');
            return titulos.length > 0 && Array.from(titulos).every(t => t.textContent?.trim() !== '');
        }, { timeout: 25_000 });

        const overload = this.page.locator('.cmp-overload');
        if (await overload.isVisible().catch(() => true)) {
            await overload.waitFor({ state: 'hidden', timeout: 25_000 });
        }

        const pageError = this.page.locator('.cmp-page-error');
        if (await pageError.isVisible().catch(() => true)) {
            throw new Error('Kardex abrió en estado de error (.cmp-page-error) antes de hacer click en VER DETALLE');
        }
    }

    async buscarPorCodigo(codigo: string): Promise<void> {
        try {
            await this.esperarSinOverload(25_000);
            const searchInput = this.page.getByRole('textbox', { name: 'Buscar por nombre, código o c' });
            await searchInput.click();
            await searchInput.fill(codigo);
            await searchInput.press('Enter');

            const { esperarDebounce } = require('../../utils/wait-helpers');
            await esperarDebounce(this.page, 1000, 'Debounce búsqueda kardex');

            await this.esperarSinOverload(25_000);
            await expect(this.page.getByRole('table').getByText(codigo).first()).toBeVisible({ timeout: 15_000 });
        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.kardex.buscarProducto,
                technicalDetail: `${FUNCTIONAL_CATALOG.kardex.buscarProducto.technicalDetail} Código buscado: ${codigo}.`,
                cause: error,
            });
        }
    }

    async clickAlmacenMultiple(): Promise<void> {
        await this.page
            .locator('div')
            .filter({ hasText: /^Varios\*$/ })
            .first()
            .click();
    }

    async clickVariosTexto(itemCodigo?: string): Promise<void> {
        if (itemCodigo) {
            await this.page.getByRole('row', { name: new RegExp(itemCodigo, 'i') })
                .getByText('Varios*').first().click();
        } else {
            await this.page.getByText('Varios*').first().click();
        }
    }

    async clickVariosNth(index: number): Promise<void> {
        await this.page.getByText('Varios*').nth(index).click();
    }

    async clickKardexPorProducto(itemCodigo?: string): Promise<void> {
        try {
            if (itemCodigo) {
                await this.page.getByRole('row', { name: new RegExp(itemCodigo, 'i') })
                    .getByRole('button', { name: 'Kardex por producto' }).first().click();
            } else {
                await this.page.getByRole('button', { name: 'Kardex por producto' }).first().click();
            }
            await this.esperarSinOverload();
            await expect(this.page.getByText('Información básica')).toBeVisible({ timeout: 25_000 });
            await this.verDetalleButtons().first().waitFor({ state: 'visible', timeout: 25_000 }).catch(() => {
            });
        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.kardex.abrirKardexProducto,
                cause: error,
            });
        }
    }

    async clickKardexPorProductoAlmacen(nombreAlmacen: string): Promise<void> {
        await this.page
            .getByRole('row')
            .filter({ hasText: new RegExp(nombreAlmacen, 'i') })
            .getByRole('button', { name: 'Kardex por producto' })
            .first()
            .click();
        await this.esperarSinOverload();
        await this.verDetalleButtons().first().waitFor({ state: 'visible', timeout: 25_000 }).catch(() => {
        });
    }

    async clickVarianteEnKardex(nombre: string): Promise<void> {
        await this.page.getByText(nombre).click();
    }

    async abrirKardexVariante(rowName: string): Promise<void> {
        await this.page.getByRole('row', { name: rowName }).getByRole('button').click();
    }

    async abrirVerDetalle(indice: number = 0): Promise<void> {
        await this.esperarSinOverload();
        const btn = this.verDetalleButtons();

        if (indice === 0) {
            await btn.first().waitFor({ state: 'visible', timeout: 25_000 });
            await this.esperarSinOverload();
            await btn.first().click();
        } else {
            await btn.nth(indice).waitFor({ state: 'visible', timeout: 25_000 });
            await this.esperarSinOverload();
            await btn.nth(indice).click();
        }
    }

    async abrirVerDetallePorAlmacen(nombreAlmacen: string): Promise<void> {
        const strip = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const parts = strip(nombreAlmacen)
            .split(/\s+/)
            .filter(Boolean)
            .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const nombreRx = new RegExp(parts.join('.*'), 'i');

        const cardAlmacen = this.page
            .locator('div, article, section')
            .filter({ hasText: nombreRx })
            .filter({
                has: this.page.locator(
                    'button[id="lgt_kardexs_cmp-cards-almacen:card-almacen_v-button:ver-detalle"]'
                ),
            })
            .first();

        await cardAlmacen.scrollIntoViewIfNeeded();

        const boton = cardAlmacen.locator(
            'button[id="lgt_kardexs_cmp-cards-almacen:card-almacen_v-button:ver-detalle"]'
        ).first();

        await boton.waitFor({ state: 'visible', timeout: 10_000 });
        await boton.click();

        await this.esperarSinOverload();
    }

    async abrirVerDetallePorAlmacen2(nombreAlmacen: string): Promise<void> {
        try {
            const strip = (s: string) =>
                s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            const nombreNormalizado = strip(nombreAlmacen).trim().toLowerCase();

            await this.esperarKardexListo();

            const cards = this.page.locator('.cmp-cards-almacen');
            await this.page.waitForFunction(() => {
                const titulos = document.querySelectorAll('.cmp-cards-almacen .info-almacen .title');
                return titulos.length > 0 && Array.from(titulos).every(t => t.textContent?.trim() !== '');
            }, { timeout: 20_000 });

            const total = await cards.count();

            for (let i = 0; i < total; i++) {
                const card = cards.nth(i);

                const titulo = await card.locator('.info-almacen .title').innerText();
                const tituloNormalizado = strip(titulo).trim().toLowerCase();

                if (tituloNormalizado.includes(nombreNormalizado)) {
                    const boton = card.getByRole('button', { name: /ver detalle/i });
                    await boton.waitFor({ state: 'visible', timeout: 10_000 });
                    await card.scrollIntoViewIfNeeded();
                    await boton.click();
                    await this.esperarSinOverload();
                    return;
                }
            }

            throw new Error(`No se encontró el almacén: ${nombreAlmacen}`);
        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.kardex.abrirDetalleAlmacen,
                flowStep: `${FUNCTIONAL_CATALOG.kardex.abrirDetalleAlmacen.flowStep}: ${nombreAlmacen}`,
                technicalDetail: `${FUNCTIONAL_CATALOG.kardex.abrirDetalleAlmacen.technicalDetail} Almacén: ${nombreAlmacen}.`,
                cause: error,
            });
        }
    }

    async clickCodigoMovimiento(patron: string): Promise<void> {
        await this.page.getByText(patron).click();
    }

    async clickCodigoMovimientoRegex(regex: RegExp): Promise<void> {
        const elemento = this.page.getByText(regex).first();
        await elemento.waitFor({ state: 'visible' });
        await elemento.click();
    }

    async expectPatronCodigoMovimientoVisible(patron: RegExp): Promise<void> {
        await expect(this.page.getByText(patron).first()).toBeVisible({ timeout: 15_000 });
    }

    async cerrarModalDetalle(): Promise<void> {
        const candidatos: Locator[] = [
            this.page.locator('.v-modal .button-close .icon').first(),
            this.page.locator('.v-modal .button-close').first(),
            this.page.locator('.v-dialog--active .button-close .icon').first(),
            this.page.getByRole('button', { name: /^Cerrar$/i }).first(),
            this.page.locator('.v-modal > div').first(),
        ];

        for (const loc of candidatos) {
            try {
                if (await loc.isVisible({ timeout: 1_500 })) {
                    await loc.click({ timeout: 5_000 });
                    await this.page.locator('.v-dialog--active').waitFor({
                        state: 'hidden',
                        timeout: 3_000
                    }).catch(() => {
                    });
                    return;
                }
            } catch {
            }
        }

        await this.page.keyboard.press('Escape');
    }

    async clickDatosOpcionales(): Promise<void> {
        await this.page.getByText('Datos opcionales').click();
    }

    async clickDatosOpcionalesDiv(): Promise<void> {
        await this.page
            .locator('div')
            .filter({ hasText: /^Datos opcionales$/ })
            .first()
            .click();
    }

    async expectDatosOpcionalesVisible(): Promise<void> {
        const contenido = this.page
            .locator('div')
            .filter({ hasText: /^Datos opcionales$/ })
            .first()
            .locator('..')
            .locator('div, span, p')
            .filter({ hasText: /.+/ })
            .first();

        await expect(contenido).toBeVisible({ timeout: 5_000 });
    }

    async navegarAIngresosDesdeKardex(): Promise<void> {
        await this.page.getByText('Ingresos').click();
    }

    async navegarASalidasDesdeKardex(): Promise<void> {
        await this.page.getByText('Salidas').click();
    }

    async navegarAStockDesdePopup(): Promise<void> {
        await this.page.getByText('Productos y servicios').click();
        await this.page.getByText('Stock de productos').click();
    }

    async navegarAKardexDesdePopup(): Promise<void> {
        await this.page.getByText('Productos y servicios').click();
        await this.page
            .locator('.select-2 > .popup-container > .v-popup > span > .v-select > .v-select-plain > .v-select-base > .v-select-base-header > .v-select-header-plain > div > .v-select-header-plain-arrow')
            .click();
        await this.page
            .locator('[id="nvg_selects_cmp-header-selects_select:select-module-206-item-2016"]')
            .click();
    }

    async navegarAKardexTotalDesdePopup1(): Promise<void> {
        await this.page.getByText('Productos y servicios').click();
        await this.page.getByText('Kardex total').click();
    }
}
