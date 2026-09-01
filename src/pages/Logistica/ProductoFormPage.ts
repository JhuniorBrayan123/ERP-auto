import {expect, type Page} from '@playwright/test';
import {ItemFormBasePage} from './ItemFormBasePage';
import type {ISCConfig, StockConfig} from '@app-types/item-data.types';

export class ProductoFormPage extends ItemFormBasePage {
    constructor(page: Page) {
        super(page);
    }

    

    async iniciarCreacionProducto(): Promise<void> {
        await this.botonCrearItems.click();
        await this.page.getByText('PNuevo producto').click();
    }

    async crearProducto(): Promise<void> {
        await this.clickBotonCrear('producto');
    }

    async llenarPrecios(precioVenta: string, precioCompra: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Monto final'});
        await input.first().click();
        await input.first().fill(precioVenta);
        await input.nth(1).click();
        await input.nth(1).fill(precioCompra);
    }

    async llenarCodigo(codigo: number): Promise<void> {
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

    async configurarStock(config: StockConfig): Promise<void> {
        await this.irATabStock();
        await this.seleccionarControlStock(config.tipo);
        if (config.tipo !== 'sin_control' && config.cantidadMaxima) {
            await this.llenarCantidadesStock(config.cantidadMaxima);
        }
    }

    async seleccionarControlStock(tipo: 'estricto' | 'flexible' | 'sin_control'): Promise<void> {
        const ids: Record<string, string> = {
            estricto: 'lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto',
            flexible: 'lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-flexible',
            sin_control: 'lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:sin-control-stock',
        };
        await this.page.locator(`[id="${ids[tipo]}"]`).click();
    }

    async llenarCantidadesStock(cantidad: string): Promise<void> {
        const cards = this.page.locator('.cmp-card-almacen');
        const count = await cards.count();
        for (let i = 0; i < count; i++) {
            await cards.nth(i).locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').click();
            await cards.nth(i).locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').fill(cantidad);
        }
    }

    async seleccionarAlmacenEspecifico(nombreAlmacen: string): Promise<void> {
        await this.page.locator('div').filter({hasText: /^Todos$/}).nth(3).click();
        await this.page.locator('.v-checkbox-default-label > span').first().click();
        await this.page.getByText(nombreAlmacen).click();
        await this.page.locator('.vector').click();
    }

    

    async llenarInfoAdicional(
        categoria: string,
        subcategoria: string,
        marca: string,
    ): Promise<void> {
        await this.irATabInfoAdicional();

        await this.page.locator(`.subcategoria > ${this.DROPDOWN_ARROW}`).first().click();
        await this.page.getByText(categoria, {exact: true}).click();
        await this.esperarLoader();

        await this.page.locator(`div:nth-child(2) > ${this.DROPDOWN_ARROW}`).click();
        await this.page.getByText(subcategoria, {exact: true}).click();
        await this.esperarLoader();

        await this.page.locator(`div:nth-child(3) > ${this.DROPDOWN_ARROW}`).click();
        await this.page.getByText(marca, {exact: true}).click();
        await this.esperarLoader();
    }

    async seleccionarTipoAfectacionIGV(opcionTexto: string): Promise<void> {
        await this.page.locator('.v-select-header-form-arrow.form.form-control').click();
        await this.page.getByText(opcionTexto, {exact: true}).click();
    }

    async activarICBPER(): Promise<void> {
        await this.page
            .locator('.impuestos > div:nth-child(2) > .v-switch > .switch-content > .switch > .slider')
            .first()
            .click();
    }

    async configurarISC(config: ISCConfig): Promise<void> {
        await this.page
            .locator('.row > div:nth-child(2) > div:nth-child(2) > .v-switch > .switch-content > .switch > .slider')
            .click();

        if (config.tipoSistema === 'Sistema al valor') {
            await this.page.locator('.v-select-header-form-arrow.invalid').click();
            await this.page.locator('div').filter({hasText: /^Sistema al valor$/}).click();
        } else {
            await this.page.locator('div').filter({hasText: /^Tipo de sistema ISC$/}).nth(2).click();
            await this.page.getByText('Aplicación al monto fijo').click();
        }

        const inputName = config.tipoSistema === 'Sistema al valor' ? '%' : 'S/';
        const inputMonto = this.page.getByRole('textbox', {name: inputName, exact: true});
        await inputMonto.click();
        await inputMonto.fill(config.monto);
    }

    

    async irATabVariantes(): Promise<void> {
        await this.page.getByText('Variantes(Opcional)').click();
    }

    async crearAtributoVariante(titulo: string, opciones: string[]): Promise<void> {
        const botonAñadirAtributo = this.page
            .locator('[id="lgt_reg-item_v-tab:variantes-item_cmp-option-button:addVariante"].cmp-option-button');
        await botonAñadirAtributo.click();

        const opcionExistente = this.page.locator('.opcion').filter({hasText: titulo}).first();
        const yaExiste = await opcionExistente
            .waitFor({state: 'visible', timeout: 3_000})
            .then(() => true)
            .catch(() => false);
        if (yaExiste) {
            const checkbox = opcionExistente.locator('input[type="checkbox"]');
            const estaMarcado = await checkbox.isChecked();
            if (!estaMarcado) {
                console.log(`   Atributo "${titulo}" ya existe — marcándolo para el producto`);
                await opcionExistente.locator('.v-checkbox-grid-label').click();
            } else {
                console.log(`   Atributo "${titulo}" ya existe y está marcado — sin cambios`);
            }
            await botonAñadirAtributo.click();
            return;
        }

        await this.page.getByRole('button', {name: 'Crear nuevo atributo'}).click();

        const inputTitulo = this.page.getByRole('textbox', {name: 'Digita el título del nuevo'});
        await inputTitulo.click();
        await inputTitulo.fill(titulo);

        for (let i = 0; i < opciones.length; i++) {
            const inputOpcion = this.page.getByRole('textbox', {name: `Opción ${i + 1}`});
            await inputOpcion.click();
            await inputOpcion.fill(opciones[i]);
        }

        await this.page.getByRole('button', {name: 'Crear atributo'}).click();
        await expect(this.page.locator('body')).toContainText('El atributo fue creado exitosamente');
        await this.page.locator('.v-modal > div').first().click();
    }

    async eliminarAtributoCreado(nombreAtributo: string): Promise<void> {
        await this.page.locator('div').filter({hasText: /^Añadir atributo$/}).nth(1).click();

        const opcion = this.page.locator('.opcion').filter({hasText: nombreAtributo});
        await opcion.locator('.v-checkbox-grid-label').click();
        await opcion.locator('.icon.eliminacion').click();

        await this.page.getByRole('button', {name: 'Eliminar'}).click();
        await this.page.locator('.v-modal > div').first().click();
    }

    async agregarVariante(
        indice: number,
        nombre: string,
        stock?: { cantidadMaxima: string; cantidadMinima: string },
    ): Promise<void> {
        await this.page.getByText('Añadir una nueva variante').click();

        const dropdownOpciones = this.page.locator(
            '[id="lgt_reg-item_v-tab:variantes-item_cmp-dropdown:opciones"]',
        ).nth(indice);
        await dropdownOpciones.click();

        await this.page.locator(
            '[id="lgt_reg-item_v-tab:variantes-item_cmp-dropdown:btn-cambiar-nombre"]',
        ).nth(indice).click();

        const inputNombre = this.page.locator(
            '[id="lgt_reg-item_v-tab:variantes-item_combinacion-variante-item-list:combinacion_v-input:nombre"]',
        );
        await inputNombre.click();
        await inputNombre.fill(nombre);

        await this.page.locator(
            '[id="lgt_reg-item_v-tab:variantes-item_combinacion-variantes-item-list:item_div:btn-editar-combinacion"]',
        ).click();

        if (stock) {
            await dropdownOpciones.click();
            await this.page.locator(
                '[id="lgt_reg-item_v-tab:variantes-item_cmp-dropdown:btn-administrar-stock"]',
            ).nth(indice).click();

            const inputMax = this.page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').first();
            await inputMax.click();
            await inputMax.fill(stock.cantidadMaxima);

            const inputMin = this.page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').nth(1);
            await inputMin.click();
            await inputMin.fill(stock.cantidadMinima);

            await this.page.getByRole('button', {name: 'Guardar stock'}).click();
        }
    }

    

    async crearEquivalencia(config: {
        nombre: string;
        factor: number;
        tipoAfectacion: string;
        precioVenta: string;
        precioCompra: string;
        esPrimera: boolean;
    }): Promise<void> {

        await this.irATabEquivalencias();

        if (config.esPrimera) {
            await this.page.getByText('AQUÍ', {exact: true}).first().click();
        } else {
            await this.page.getByRole('button', {name: 'Agregar equivalencia'}).click();
        }

        const inputNombre = this.page.getByRole('textbox', {name: 'Digita el nombre de la'});
        await inputNombre.click();
        await inputNombre.fill(config.nombre);

        const inputFactor = this.page.locator(
            '[id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad"]',
        );
        await inputFactor.click();
        await inputFactor.fill(String(config.factor));

        await this.page.locator('.v-select-header-base-form:visible')
            .filter({hasText: /^Seleccionar$/}).first().click({force: true});
        await this.page.getByText(config.tipoAfectacion).last().click();

        const inputPrecio = this.page.getByRole('textbox', {name: 'Monto final'});
        await inputPrecio.first().click();
        await inputPrecio.first().fill(config.precioVenta);
        await inputPrecio.nth(1).click();
        await inputPrecio.nth(1).fill(config.precioCompra);

        await this.page.getByRole('button', {name: 'Crear Equivalencia'}).click();
    }

    

    async esperarLoader(): Promise<void> {
        await this.page.locator('[id="cmn_cmp-overload:loading"]')
            .waitFor({state: 'visible', timeout: 2_000}).catch(() => {});
        await this.page.locator('[id="cmn_cmp-overload:loading"]')
            .waitFor({state: 'hidden', timeout: 15_000}).catch(() => {});
    }
}
