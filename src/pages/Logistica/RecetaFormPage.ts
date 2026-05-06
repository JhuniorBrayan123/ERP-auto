import {type Page} from '@playwright/test';
import {ItemFormBasePage} from './ItemFormBasePage';
import type {InsumoReceta, SelectorConfig} from '../../helpers/Logistica/item-data.types';

export class RecetaFormPage extends ItemFormBasePage {
    constructor(page: Page) {
        super(page);
    }

    async iniciarCreacionReceta(): Promise<void> {
        await this.botonCrearItems.click();
        await this.page.getByText('RNueva receta').click();
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
    async irATabInsumos(): Promise<void> {
        await this.page
            .locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]')
            .nth(1)
            .click();
    }

    async buscarYAgregarInsumo(insumo: InsumoReceta): Promise<void> {
        await this.esperarSinOverlay();

        const inputBuscar = this.page.getByRole('textbox', {
            name: 'Buscar nombre del producto, c',
        });
        await inputBuscar.click();
        await inputBuscar.fill(insumo.codigoBusqueda);
        await this.page.getByText(insumo.textoSeleccion).first().click();

        // Espera solo el overlay de carga, NO el overscreen
        await this.esperarSoloOverload();

        if (insumo.variante) {
            await this.page.getByText(insumo.variante).first().click();
            await this.esperarSoloOverload();
        }

        if (insumo.equivalencia) {
            // El modal de equivalencia está abierto — click directo dentro de él
            const modal = this.page.locator('#cmn_cmp-overscreen\\:block.is-open');
            await modal.waitFor({state: 'visible', timeout: 10_000});
            await modal.getByText(insumo.equivalencia).first().click();
            // Ahora sí espera que el modal se cierre tras la selección
            await modal.waitFor({state: 'hidden', timeout: 10_000});
            await this.esperarSoloOverload();
        }
    }

    private async esperarSinOverlay(): Promise<void> {
        await this.esperarSoloOverload();
        await this.page.locator('#cmn_cmp-overscreen\\:block.is-open')
            .waitFor({state: 'hidden', timeout: 10_000})
            .catch(() => {
            });
    }

    private async esperarSoloOverload(): Promise<void> {
        await this.page.locator('[id="cmn_cmp-overload:loading"]')
            .waitFor({state: 'hidden', timeout: 10_000})
            .catch(() => {
            });
    }

    async irATabSelectores(): Promise<void> {
        await this.page
            .locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-5"]')
            .nth(4)
            .click();
    }

    async clickAnadirSelector(): Promise<void> {
        await this.page.locator('div').filter({hasText: /^Añadir selector$/}).first().click();
    }

    async crearSelector(config: SelectorConfig): Promise<void> {
        await this.clickAnadirSelector();
        await this.page.getByRole('button', {name: 'Nuevo selector'}).click();

        const inputTitulo = this.page.getByRole('textbox', {
            name: 'Digita el título del selector',
        });
        await inputTitulo.click();
        await inputTitulo.fill(config.titulo);

        if (config.opcionesManuales && config.opcionesManuales.length > 0) {
            await this.page
                .locator('[id="lgt_reg-item_cmp-card-selectores:opcion_div:libre"]')
                .click();

            for (let i = 0; i < config.opcionesManuales.length; i++) {
                const opcion = config.opcionesManuales[i];

                if (i > 0) {
                    await this.page.getByRole('button', {name: 'Añadir opción'}).click();
                }

                const inputNombre = this.page
                    .locator(
                        '[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:nombre"]',
                    )
                    .nth(i);
                const inputPrecio = this.page
                    .locator(
                        '[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]',
                    )
                    .nth(i);

                await inputNombre.click();
                await inputNombre.fill(opcion.nombre);
                await inputPrecio.click();
                await inputPrecio.fill(opcion.precio);
            }
        }

        if (config.itemBusqueda) {
            await this.page.getByText('Crear selectores con ítems de').click();
            const inputBuscar = this.page.getByRole('textbox', {
                name: 'Buscar nombre del producto o',
            });
            await inputBuscar.click();
            await inputBuscar.fill(config.itemBusqueda.codigo);
            await this.page.getByText(config.itemBusqueda.textoSeleccion).click();
            await this.page.locator('.v-modal > div').first().click();

            const numOpcionesPrevias = config.opcionesManuales?.length ?? 0;
            const inputPrecioCatalogo = this.page
                .locator(
                    '[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]',
                )
                .nth(numOpcionesPrevias);
            await inputPrecioCatalogo.click();
            await inputPrecioCatalogo.fill(config.itemBusqueda.precio);
        }

        await this.page.getByRole('button', {name: 'Crear selector'}).click();
    }

    async marcarSelectorObligatorio(): Promise<void> {
        await this.page.locator('.obligatorio > div').click();
    }

    async llenarCodigoBarras(codigo: string): Promise<void> {
        const input = this.page.getByRole('textbox', {
            name: 'Escanea o digita el código de',
        });
        await input.click();
        await input.fill(codigo);
    }

    async llenarCodigoAlternativo(codigo: string): Promise<void> {
        const input = this.page.getByRole('textbox', {
            name: 'Ingresa código alternativo',
        });
        await input.click();
        await input.fill(codigo);
    }

    async llenarDescripcion(descripcion: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Descripción del ítem'});
        await input.click();
        await input.fill(descripcion);
    }

    async llenarInfoAdicional(subcategoria: string, marca: string): Promise<void> {
        await this.page
            .locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]')
            .nth(2)
            .click();

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

    async llenarInfoAdicionalAlternativo(subcategoria: string, marca: string): Promise<void> {
        await this.irATabInfoAdicional();

        await this.page
            .locator('div')
            .filter({hasText: /^Ninguna$/})
            .nth(3)
            .click();
        await this.page.getByText(subcategoria).click();

        await this.page
            .locator('div')
            .filter({hasText: /^Ninguna$/})
            .nth(3)
            .click();
        await this.page.getByText(marca).click();
    }

    async crearReceta(): Promise<void> {
        await this.clickBotonCrear('receta');
    }
}
