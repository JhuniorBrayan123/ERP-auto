import { type Page } from '@playwright/test';
import { ItemFormBasePage } from './ItemFormBasePage';
import type { ISCConfig, StockConfig } from '../../helpers/Logistica/item-data.types';

export class ProductoFormPage extends ItemFormBasePage {
    constructor(page: Page) {
        super(page);
    }

    async iniciarCreacionProducto(): Promise<void> {
        await this.botonCrearItems.click();
        await this.page.getByText('PNuevo producto').click();
    }

    async llenarPrecios(precioVenta: string, precioCompra: string): Promise<void> {
        const inputPrecioVenta = this.page.getByRole('textbox', { name: 'Monto final' }).first();
        const inputPrecioCompra = this.page.getByRole('textbox', { name: 'Monto final' }).nth(1);

        await inputPrecioVenta.click();
        await inputPrecioVenta.fill(precioVenta);
        await inputPrecioCompra.click();
        await inputPrecioCompra.fill(precioCompra);
    }

    // llenar cidgo es nuevo
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

    async seleccionarAlmacenEspecifico(nombreAlmacen: string): Promise<void> {
        await this.page.locator('div').filter({ hasText: /^Todos$/ }).nth(3).click();
        await this.page.locator('.v-checkbox-default-label > span').first().click();
        await this.page.getByText(nombreAlmacen).click();
        await this.page.locator('.vector').click();
    }

    async seleccionarControlStock(tipo: 'estricto' | 'flexible'): Promise<void> {
        const id =
            tipo === 'estricto'
                ? 'lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto'
                : 'lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-flexible';
        await this.page.locator(`[id="${id}"]`).click();
    }

    async llenarCantidadesStock(cantidadMaxima: string, cantidadMinima?: string): Promise<void> {
        const inputMax = this.page
            .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
            .first();

        await inputMax.click();
        await inputMax.fill(cantidadMaxima);

        if (cantidadMinima !== undefined) {
            const inputMin = this.page
                .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
                .nth(1);
            await inputMin.click();
            await inputMin.fill(cantidadMinima);
        }
    }

    async configurarStock(config: StockConfig): Promise<void> {
        await this.irATabStock();
        await this.seleccionarControlStock(config.tipo);
        await this.llenarCantidadesStock(config.cantidadMaxima, config.cantidadMinima);
    }

    async seleccionarTipoAfectacionIGV(opcionTexto: string): Promise<void> {
        await this.page.locator('.v-select-header-form-arrow.form.form-control').click();
        await this.page.getByText(opcionTexto, { exact: true }).click();
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
                .filter({ hasText: /^Sistema al valor$/ })
                .click();
        } else {
            await this.page
                .locator('div')
                .filter({ hasText: /^Tipo de sistema ISC$/ })
                .nth(2)
                .click();
            await this.page.getByText('Aplicación al monto fijo').click();
        }

        const inputName = config.tipoSistema === 'Sistema al valor' ? '%' : 'S/';
        const inputMonto = this.page.getByRole('textbox', { name: inputName, exact: true });
        await inputMonto.click();
        await inputMonto.fill(config.monto);
    }

    //
    async esperarLoader(): Promise<void> {
        await this.page
            .locator('[id="cmn_cmp-overload:loading"]')
            .waitFor({ state: 'visible', timeout: 2_000 })
            .catch(() => { });
        await this.page
            .locator('[id="cmn_cmp-overload:loading"]')
            .waitFor({ state: 'hidden', timeout: 15_000 })
            .catch(() => { });
    }

    async llenarInfoAdicional(
        categoria: string,
        subcategoria: string,
        marca: string,
    ): Promise<void> {
        await this.irATabInfoAdicional();

        // 1. Seleccionar Categoría
        await this.page.locator(`.subcategoria > ${this.DROPDOWN_ARROW}`).first().click();
        await this.page.getByText(categoria, { exact: true }).click();
        await this.esperarLoader();

        // 2. Seleccionar Subcategoría
        await this.page.locator(`div:nth-child(2) > ${this.DROPDOWN_ARROW}`).click();
        await this.page.getByText(subcategoria, { exact: true }).click();
        await this.esperarLoader();

        // 3. Seleccionar Marca
        await this.page.locator(`div:nth-child(3) > ${this.DROPDOWN_ARROW}`).click();
        await this.page.getByText(marca, { exact: true }).click();
        await this.esperarLoader();
    }

    // ─── Tab Variantes ────────────────────────────────────────────────

    async irATabVariantes(): Promise<void> {
        await this.page.getByText('Variantes(Opcional)').click();
    }

    /**
     * Crea un atributo de variante con título y opciones (máximo 3).
     * Flujo UI: "Añadir atributo" → "Crear nuevo atributo" → título + opciones → "Crear atributo"
     */
    async crearAtributoVariante(titulo: string, opciones: string[]): Promise<void> {
        await this.page.getByText('Añadir atributo').click();
        await this.page.getByRole('button', { name: 'Crear nuevo atributo' }).click();

        const inputTitulo = this.page.getByRole('textbox', { name: 'Digita el título del nuevo' });
        await inputTitulo.click();
        await inputTitulo.fill(titulo);

        for (let i = 0; i < opciones.length; i++) {
            const inputOpcion = this.page.getByRole('textbox', { name: `Opción ${i + 1}` });
            await inputOpcion.click();
            await inputOpcion.fill(opciones[i]);
        }

        await this.page.getByRole('button', { name: 'Crear atributo' }).click();
        // Cerrar modal de confirmación
        await this.page.locator('.v-modal > div').first().click();
    }

    /**
     * Añade una nueva variante, le cambia el nombre y opcionalmente configura su stock.
     *
     * @param indice Índice base-0 de la variante (0 = primera, 1 = segunda, etc.)
     * @param nombre Nombre de la variante (ej: "Variante 1 {estricto}")
     * @param stock Cantidades de stock max/min (opcional — solo si tiene control de stock)
     */
    async agregarVariante(
        indice: number,
        nombre: string,
        stock?: { cantidadMaxima: string; cantidadMinima: string },
    ): Promise<void> {
        await this.page.getByText('Añadir una nueva variante').click();

        // Abrir dropdown de opciones de la variante (cada card tiene el mismo ID)
        const dropdownOpciones = this.page.locator(
            '[id="lgt_reg-item_v-tab:variantes-item_cmp-dropdown:opciones"]',
        ).nth(indice);
        await dropdownOpciones.click();

        // Cambiar nombre (botón dentro del dropdown)
        await this.page.locator(
            '[id="lgt_reg-item_v-tab:variantes-item_cmp-dropdown:btn-cambiar-nombre"]',
        ).nth(indice).click();

        const inputNombreVariante = this.page.locator(
            '[id="lgt_reg-item_v-tab:variantes-item_combinacion-variante-item-list:combinacion_v-input:nombre"]',
        );
        await inputNombreVariante.click();
        await inputNombreVariante.fill(nombre);

        // Confirmar edición del nombre
        await this.page.locator(
            '[id="lgt_reg-item_v-tab:variantes-item_combinacion-variantes-item-list:item_div:btn-editar-combinacion"]',
        ).click();

        // Administrar stock si se proporcionó
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

            await this.page.getByRole('button', { name: 'Guardar stock' }).click();
        }
    }

    // ─── Tab Equivalencias ────────────────────────────────────────────

    /**
     * Crea una equivalencia con nombre, factor, tipo de afectación y precios.
     *
     * @param config.esPrimera true para la primera equivalencia (usa .arc), false para las siguientes (usa "Agregar equivalencia")
     */
    async crearEquivalencia(config: {
        nombre: string;
        factor: number;
        tipoAfectacion: string;
        precioVenta: string;
        precioCompra: string;
        esPrimera: boolean;
    }): Promise<void> {
        // Abrir drape de equivalencia
        if (config.esPrimera) {
            await this.page.getByText('AQUÍ', { exact: true }).first().click();
        } else {
            await this.page.getByRole('button', { name: 'Agregar equivalencia' }).click();
        }

        // Nombre
        const inputNombre = this.page.getByRole('textbox', { name: 'Digita el nombre de la' });
        await inputNombre.click();
        await inputNombre.fill(config.nombre);

        // Factor: poner el valor directamente en el input
        const inputFactor = this.page.locator(
            '[id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad"]',
        );
        await inputFactor.click();
        await inputFactor.fill(String(config.factor));

        // Tipo de afectación IGV
        await this.page.locator('div').filter({ hasText: /^Seleccionar$/ }).nth(2).click();
        await this.page.getByText(config.tipoAfectacion).last().click();

        // Precios
        const inputPrecioVenta = this.page.getByRole('textbox', { name: 'Monto final' }).first();
        await inputPrecioVenta.click();
        await inputPrecioVenta.fill(config.precioVenta);

        const inputPrecioCompra = this.page.getByRole('textbox', { name: 'Monto final' }).nth(1);
        await inputPrecioCompra.click();
        await inputPrecioCompra.fill(config.precioCompra);

        // Crear
        await this.page.getByRole('button', { name: 'Crear Equivalencia' }).click();
    }

    async crearProducto(): Promise<void> {
        await this.clickBotonCrear('producto');
    }
}
