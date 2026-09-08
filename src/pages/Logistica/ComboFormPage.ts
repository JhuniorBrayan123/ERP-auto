import {type Page} from '@playwright/test';
import {ItemFormBasePage} from './ItemFormBasePage';
import type {ComponenteCombo} from '@app-types/item-data.types';
import {esperarCargaOverlaySiVisible, esperarDebounce} from '@utils/wait-helpers';

export class ComboFormPage extends ItemFormBasePage {
    constructor(page: Page) {
        super(page);
    }

    async iniciarCreacionCombo(): Promise<void> {
        await esperarCargaOverlaySiVisible(this.page);
        await this.botonCrearItems.click();
        await this.page.getByText('CNuevo combo').click();
    }

    async llenarPrecios(precioVenta: string, precioCompra: string): Promise<void> {
        const inputPrecioVenta = this.page.getByRole('textbox', {name: 'Monto final'}).first();
        const inputPrecioCompra = this.page.getByRole('textbox', {name: 'Monto final'}).nth(1);

        await inputPrecioVenta.click();
        await inputPrecioVenta.fill(precioVenta);
        await inputPrecioCompra.click();
        await inputPrecioCompra.fill(precioCompra);
    }

    async llenarCodigo(codigo: number): Promise<void> {
        await this.page.getByText("Automático").first().click();
        await this.page.getByText("Manual").first().click();
        await this.page.locator('[id="lgt_reg-item_v-tab:informacion-basica_v-input:codigo"]').click();
        await this.page.locator('[id="lgt_reg-item_v-tab:informacion-basica_v-input:codigo"]').fill(codigo.toString());
    }

    async irATabComponentes(): Promise<void> {
        await this.page
            .locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]')
            .nth(1)
            .click();
    }

    async buscarYAgregarComponente(componente: ComponenteCombo): Promise<void> {
        await esperarCargaOverlaySiVisible(this.page);

        const inputBuscar = this.page.getByRole('textbox', {
            name: 'Buscar nombre del producto, c',
        });

        await inputBuscar.click();
        await inputBuscar.fill(componente.codigoBusqueda);
        await esperarDebounce(this.page, 500, 'Esperando resultados del combo');

        const resultadoEsperado = this.page.getByText(componente.textoSeleccion);
        await resultadoEsperado.first().waitFor({state: 'visible', timeout: 10_000}).catch(() => {
        });
        await resultadoEsperado.first().click();

        if (componente.variante) {
            await this.page.getByText(componente.variante).first().click();
        }

        if (componente.equivalencia) {
            await this.page.getByText(componente.equivalencia).first().click();
        }
    }

    async llenarInfoAdicional(subcategoria: string, marca: string): Promise<void> {
        await this.irATabInfoAdicional();

        await this.page
            .locator(`.subcategoria > ${this.DROPDOWN_ARROW}`)
            .first()
            .click();
        await this.page.getByText(subcategoria).click();

        await this.page
            .locator(`div:nth-child(2) > ${this.DROPDOWN_ARROW}`)
            .click();
        await this.page.getByText(marca).click();
    }

    async crearCombo(): Promise<void> {
        await this.clickBotonCrear('combo');
    }
}
