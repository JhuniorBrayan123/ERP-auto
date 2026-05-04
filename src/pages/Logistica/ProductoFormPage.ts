import {type Page} from '@playwright/test';
import {ItemFormBasePage} from './ItemFormBasePage';
import type {ISCConfig, StockConfig} from '../../helpers/Logistica/item-data.types';

export class ProductoFormPage extends ItemFormBasePage {
    constructor(page: Page) {
        super(page);
    }

    async iniciarCreacionProducto(): Promise<void> {
        await this.botonCrearItems.click();
        await this.page.getByText('PNuevo producto').click();
    }

    async llenarPrecios(precioVenta: string, precioCompra: string): Promise<void> {
        const inputPrecioVenta = this.page.getByRole('textbox', {name: 'Monto final'}).first();
        const inputPrecioCompra = this.page.getByRole('textbox', {name: 'Monto final'}).nth(1);

        await inputPrecioVenta.click();
        await inputPrecioVenta.fill(precioVenta);
        await inputPrecioCompra.click();
        await inputPrecioCompra.fill(precioCompra);
    }
    // llenar cidgo es nuevo 
    async llenarCodigo(codigo:number): Promise<void> {
        await this.page.getByText("Automático").first().click();
        await this.page.getByText("Manual").first().click();
        await this.page.locator('[id="lgt_reg-item_v-tab:informacion-basica_v-input:codigo"]').click();
        await this.page.locator('[id="lgt_reg-item_v-tab:informacion-basica_v-input:codigo"]').fill(codigo.toString());
    }
    async irATabStock(): Promise<void> {
        await this.page
            .locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]')
            .nth(1)
            .click();
    }

    async seleccionarControlStock(tipo: 'estricto' | 'flexible'): Promise<void> {
        const id =
            tipo === 'estricto'
                ? 'lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto'
                : 'lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-flexible';
        await this.page.locator(`[id="${id}"]`).click();
    }

    async llenarCantidadesStock(cantidadMaxima: string, cantidadMinima: string): Promise<void> {
        const inputMax = this.page
            .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
            .first();
        const inputMin = this.page
            .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
            .nth(1);

        await inputMax.click();
        await inputMax.fill(cantidadMaxima);
        await inputMin.click();
        await inputMin.fill(cantidadMinima);
    }

    async configurarStock(config: StockConfig): Promise<void> {
        await this.irATabStock();
        await this.seleccionarControlStock(config.tipo);
        await this.llenarCantidadesStock(config.cantidadMaxima, config.cantidadMinima);
    }

    async seleccionarTipoAfectacionIGV(opcionTexto: string): Promise<void> {
        await this.page.locator('.v-select-header-form-arrow.form.form-control').click();
        await this.page.getByText(opcionTexto, {exact: true}).click();
    }

    async activarICBPER(): Promise<void> {
        await this.page
            .locator(
                '.impuestos > div:nth-child(2) > .v-switch > .switch-content > .switch > .slider',
            )
            .first()
            .click();
    }

    async configurarISC(config: ISCConfig): Promise<void> {
        await this.page
            .locator(
                '.row > div:nth-child(2) > div:nth-child(2) > .v-switch > .switch-content > .switch > .slider',
            )
            .click();

        if (config.tipoSistema === 'Sistema al valor') {
            await this.page.locator('.v-select-header-form-arrow.invalid').click();
            await this.page
                .locator('div')
                .filter({hasText: /^Sistema al valor$/})
                .click();
        } else {
            await this.page
                .locator('div')
                .filter({hasText: /^Tipo de sistema ISC$/})
                .nth(2)
                .click();
            await this.page.getByText('Aplicación al monto fijo').click();
        }

        const inputName = config.tipoSistema === 'Sistema al valor' ? '%' : 'S/';
        const inputMonto = this.page.getByRole('textbox', {name: inputName, exact: true});
        await inputMonto.click();
        await inputMonto.fill(config.monto);
    }

//
    async llenarInfoAdicional(
        categoria: string,
        subcategoria: string,
        marca: string,
    ): Promise<void> {
        await this.irATabInfoAdicional();

        await this.page
            .locator(`.subcategoria > ${this.DROPDOWN_ARROW}`)
            .first()
            .click();
        await this.page.waitForTimeout(500);
        await this.page.locator('div').filter({hasText: new RegExp(`^${categoria}$`)}).click({force: true});

        await this.page.waitForTimeout(500);

        await this.page
            .locator(`div:nth-child(2) > ${this.DROPDOWN_ARROW}`)
            .click({force: true});
        await this.page.waitForTimeout(500);
        await this.page.getByText(subcategoria).click({force: true});

        await this.page.waitForTimeout(500);

        await this.page
            .locator(`div:nth-child(3) > ${this.DROPDOWN_ARROW}`)
            .click({force: true});
        await this.page.waitForTimeout(500);
        await this.page.getByText(marca).click({force: true});
    }

    async crearProducto(): Promise<void> {
        await this.clickBotonCrear('producto');
    }
}
