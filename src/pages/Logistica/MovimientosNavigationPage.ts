import {type Page} from '@playwright/test';
import {FUNCTIONAL_CATALOG} from '../../utils/functional-catalog';
import {runFunctionalAction} from '@utils/functional-step';
import {esperarCargaOverlaySiVisible} from '../../utils/wait-helpers';

export class MovimientosNavigationPage {
    constructor(private readonly page: Page) {
    }

    private async clickProductosYServicios(): Promise<void> {
        await runFunctionalAction(this.page, FUNCTIONAL_CATALOG.movimientos.navegarIngresos, async () => {
            await this.page.getByText('Productos y servicios').first().click();
        });
    }

    async navegarAIngresos(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page.getByText('Ingresos', {exact: true}).click();
        await esperarCargaOverlaySiVisible(this.page);
    }

    async navegarASalidas(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page.locator('.v-popu, .popup-container, nav')
            .getByText('Salidas', {exact: true})
            .first()
            .click();
        await esperarCargaOverlaySiVisible(this.page);
    }

    async navegarAAjustes(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page.getByText('Ajustes').click();
        await esperarCargaOverlaySiVisible(this.page);
    }

    async navegarATraslados(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page.getByText('Traslados', {exact: true}).click();
        await esperarCargaOverlaySiVisible(this.page);
    }

    async navegarAStockProductos(): Promise<void> {
        await runFunctionalAction(this.page, FUNCTIONAL_CATALOG.stock.buscarProducto, async () => {
            await this.clickProductosYServicios();
            await this.page.getByText('Stock de productos').click();
            await esperarCargaOverlaySiVisible(this.page);
        });
    }

    async navegarAKardexTotal(): Promise<void> {
        await runFunctionalAction(this.page, FUNCTIONAL_CATALOG.kardex.buscarProducto, async () => {
            await this.clickProductosYServicios();
            await this.page.getByText('Kardex total').click();


            await this.page.waitForLoadState('networkidle');

            await esperarCargaOverlaySiVisible(this.page);
        });
    }

    async navegarAItemsProductos(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page
            .locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]')
            .click();
        await esperarCargaOverlaySiVisible(this.page);
    }

    async navegarAItemsInsumos(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page
            .locator('[id="nvg_selects_cmp-header-selects_select:select-module-202-item-2006"]')
            .click();
        await esperarCargaOverlaySiVisible(this.page);
    }

    async navegarAIngresosDesdeMenu(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page.locator('.v-popu, .popup-container, nav')
            .getByText('Ingresos', {exact: true})
            .first()
            .click();
        await esperarCargaOverlaySiVisible(this.page);
    }

    async navegarASalidasDesdeMenu(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page
            .locator('[id="nvg_selects_cmp-header-selects_select:select-module-204-item-2010"]')
            .click();
        await esperarCargaOverlaySiVisible(this.page);
    }

    async navegarAAjustesDesdeMenu(): Promise<void> {
        await this.clickProductosYServicios();
        await this.page
            .locator('[id="nvg_selects_cmp-header-selects_select:select-module-204-item-2012"]')
            .click();
        await esperarCargaOverlaySiVisible(this.page);
    }

    async navegarAConfiguracionSucursales(): Promise<void> {
        const baseUrl = process.env.BASE_URL || '';
        await this.page.goto(`${baseUrl}configuracion/sistema/sucursales`);
        await esperarCargaOverlaySiVisible(this.page)
    }
}
