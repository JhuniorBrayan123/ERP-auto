import {type Page} from '@playwright/test';
import {esperarCargaOverlay} from "@utils/wait-helpers";

export class MovimientoRapidoPage {
    constructor(private readonly page: Page) {
    }

    async abrirMenuItemAcciones(codigoItem: string): Promise<void> {
        const filaItem = this.page
            .getByRole('row')
            .filter({hasText: codigoItem})
            .first();

        await filaItem.waitFor({state: 'visible', timeout: 15_000});

        await filaItem
            .locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle')
            .click();
    }

    async clickVerStockSimple(): Promise<void> {
        await this.page
            .locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:visualizar-item"]')
            .click();
    }

    async clickAumentarStockDesdeVisualizacion(nombreAlmacen: string): Promise<void> {
        await this.page
            .locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:visualizar-item"]')
            .click();
        await esperarCargaOverlay(this.page);

        
        const card = this.page
            .locator('.stock-almacen')
            .filter({ has: this.page.locator('.descripcion', { hasText: nombreAlmacen }) });

        
        await card
            .locator('.stock .opciones [id="lgt_items_v-modal:stock-item_cmp-dropdown:stock-almacen-opciones"]')
            .click();

        await esperarCargaOverlay(this.page);

        await this.page
            .locator('[id="lgt_items_v-modal:stock-item_cmp-dropdown:stock-almacen-opciones_cmp-dropdown-item:aumentar-stock"]')
            .getByText('Aumentar stock')
            .click();
    }


    async clickIncrementarStockVariante(): Promise<void> {
        await this.page
            .locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:incrementar-stock"]')
            .click();
    }

    async clickDisminuirStockDesdeMenu(): Promise<void> {
        await this.page
            .locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:disminuir-stock"]')
            .click();
    }

    async seleccionarAlmacenRapido2(almacen: string): Promise<void> {
        await this.page
            .locator('[id="lgt_items_v-modal:movimiento-stock_v-select:almacen"] div')
            .filter({hasText: /^Seleccionar$/})
            .click();

        await this.page
            .locator('[id="lgt_items_v-modal:movimiento-stock_v-select:almacen"]')
            .getByText(almacen, {exact: true})
            .last() 
            .click();
    }

    async seleccionarAlmacenRapido(almacen: string): Promise<void> {
        await this.page
            .locator('[id="lgt_items_v-modal:movimiento-stock_v-select:almacen"] div')
            .filter({hasText: /^Seleccionar$/})
            .click();
        await this.page.locator('form').getByText(almacen).click();
    }

    async seleccionarMotivoIngresoRapido(motivoActual: string, motivoNuevo: string): Promise<void> {
        await this.page
            .locator('[id="lgt_items_v-modal:movimiento-stock_v-select:motivo"] div')
            .filter({hasText: new RegExp(`^${motivoActual.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)})
            .click();
        await this.page.getByText(motivoNuevo, {exact: true}).click();
    }

    async clickexpandeVariante(codigoItem: string): Promise<void> {
        await this.page
            .getByRole('row')
            .filter({hasText: '313131'})
            .locator('.icon-item')
            .first()
            .click();
        ;
    }

    async seleccionarAccionVarianter(codigoItem: string): Promise<void> {
        await this.page.locator('.cmp-dropdown-toggle.justify-content-center')
            .filter({hasText: new RegExp(`^${codigoItem}`)})
            .first().click();
    }

    async seleccionarMotivoIngresoAlmacenNth(motivo: string, nth: number = 1): Promise<void> {
        await this.page.getByText(motivo).nth(nth).click();
    }

    async seleccionarMotivoSalidaRapido(motivoActual: string, motivoNuevo: string): Promise<void> {
        await this.page
            .locator('[id="lgt_items_v-modal:movimiento-stock_v-select:motivo"]')
            .getByText(motivoActual)
            .click();
        await this.page.getByText(motivoNuevo).click();
    }

    async seleccionarMotivoSalidaDesdeDiv(motivoActual: string, motivoNuevo: string): Promise<void> {
        await this.page
            .locator('[id="lgt_items_v-modal:movimiento-stock_v-select:motivo"] div')
            .filter({hasText: new RegExp(`^${motivoActual.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)})
            .click();
        await this.page.getByText(motivoNuevo).click();
    }

    async llenarCantidadRapida(cantidad: string): Promise<void> {
        const input = this.page.locator(
            '[id="lgt_items_v-modal:movimiento-stock_v-step:cantidad"]',
        );
        await input.click();
        await input.fill(cantidad);
    }

    async clickBtnAumentarStock(): Promise<void> {
        await this.page.getByRole('button', {name: 'Aumentar stock'}).click();
    }

    async clickBtnRetirarStock(): Promise<void> {
        await this.page.getByRole('button', {name: 'Retirar stock'}).click();
    }

    async leerStockDelAlmacenEnModal(nombreAlmacen: string): Promise<number> {
        await this.page
            .locator('.v-modal')
            .getByText(/Stock:/i)
            .first()
            .waitFor({state: 'visible', timeout: 10_000});

        const textoModal = (await this.page.locator('.v-modal').first().textContent() ?? '').trim();

        const escapedName = nombreAlmacen.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`${escapedName}[\\s\\S]{0,300}?Stock:\\s*([\\d.,]+)`, 'i');
        const match = textoModal.match(regex);

        if (!match) return 0;

        const valorBruto = match[1]
            .replace(/[.,](\d{3})(?!\d)/g, '$1') 
            .replace(',', '.');                    

        const stockActual = parseInt(valorBruto, 10);
        return isNaN(stockActual) ? 0 : stockActual;
    }

    async cerrarModalConfirmacion(): Promise<void> {
        await this.page.locator('.v-modal > div').first().click();
    }

    async cerrarModalCancelarModal(): Promise<void> {
        await this.page.locator('.v-modal > div').first().click();
    }

    async buscarItemPorCodigo(codigo: string): Promise<void> {
        const searchInput = this.page.getByRole('textbox', {name: 'Buscar por nombre, código o c'});
        await searchInput.click();
        await searchInput.fill(codigo);
        await searchInput.press('Enter');
    }

    async clickVarianteEnLista(nthChild: number): Promise<void> {
        await this.page
            .locator(`tr:nth-child(${nthChild}) > td:nth-child(13) > .flex-row-align-items-center-justify-content-center`)
            .click();
    }

    async filtrarPorTipoItem(tipo: string): Promise<void> {
        await this.page.getByText(tipo, {exact: true}).first().click();
    }

    async abrirTabInsumos(): Promise<void> {
        await this.page.locator('[id="lgt_items_cmp-datos-item:filter_section:section_tipo_tipo_item:3"]');
    }

    async seleccionarcardProductos(): Promise<void> {
        await this.page.locator('[id="lgt_movimientos_creacion-masivo_cmp-tipo-movimiento:elegir-tipo-movimiento_cmp-card-movimiento:ingreso"]').first().click();
    }

    async clickBusquedaDeItems(): Promise<void> {
        await this.page
            .locator('div')
            .filter({hasText: /^Búsqueda de ítems$/})
            .nth(2)
            .click();
    }
}
