import {type Page} from '@playwright/test';
import {esperarCargaOverlay} from "@utils/wait-helpers";
import type {BcCategoria, BcPresetFecha} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

export class ComprobantesFiltrosComponent {
    constructor(private readonly page: Page) {
    }

    async seleccionarCategoria(categoria: BcCategoria): Promise<void> {
        await this.page.locator(
            `[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-${categoria}"]`,
        ).click();
        await esperarCargaOverlay(this.page);
    }

    async abrirFiltrosAvanzados(): Promise<void> {
        const btn = this.page.locator(
            '[id="pv_comprobantes_cmp-filtros-comprobantes:state_v-button-filter-border:activar-filtros-avanzados"]',
        );
        try {
            await btn.waitFor({state: 'visible', timeout: 30_000});
            await btn.click();
        } catch {
            
        }
    }

    async aplicarFiltros(): Promise<void> {
        await this.page.getByRole('button', {name: 'Aplicar filtros'}).click();
        await esperarCargaOverlay(this.page);
    }

    async borrarFiltros(): Promise<void> {
        await this.page.getByRole('button', {name: 'Borrar filtros'}).click();
        await esperarCargaOverlay(this.page);
    }

    async filtrarPorCorrelativo(correlativo: string): Promise<void> {
        await this.abrirFiltrosAvanzados();

        const inputCorrelativo = this.page.locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes-header:header-grilla_v-input:Correlativo"]',
        );
        await inputCorrelativo.click();
        await inputCorrelativo.fill(correlativo);
        await inputCorrelativo.press('Enter');
    }

    async filtrarPorRangoFecha(preset: BcPresetFecha): Promise<void> {
        await this.page.locator(
            '[id="pv_comprobantes_cmp-filtros-basicos-comprobantes:state_v-datepicker-range:rango-fecha"]',
        ).click();
        await this.page.getByRole('button', {name: preset, exact: true}).click();
        await this.aplicarFiltros();
    }

    async filtrarPorTipo(tipo: string): Promise<void> {
        await this.page.getByText('Tipo de comprobante').first().click();
        await this.page.getByText(tipo, {exact: true}).click();
        await esperarCargaOverlay(this.page);
    }

    async filtrarPorSerie(serie: string): Promise<void> {
        await this.page.locator('div').filter({hasText: /^Serie$/}).nth(2).click();
        await this.page.locator('thead').getByText(serie).click();
        await esperarCargaOverlay(this.page);
    }

    async filtrarPorMoneda(moneda: string): Promise<void> {
        await this.page.getByText('Moneda').first().click();
        await this.page.locator('thead').getByText(moneda).click();
        await esperarCargaOverlay(this.page);
    }

    async filtrarPorCorrelativos(correlativo: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Correlativo'});
        await input.click();
        const valorFiltro = correlativo.replace(/^0+/, '') || '0';
        await input.fill(valorFiltro);
        await input.press('Enter');
        await esperarCargaOverlay(this.page);
    }

    async filtrarPorNombreCliente(nombre: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Nombre / Razón Social'});
        await input.click();
        await input.fill(nombre);
        await input.press('Enter');
        await esperarCargaOverlay(this.page);
    }

    async filtrarPorNumDocCliente(documento: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'N° de Documento'});
        await input.click();
        await input.fill(documento);
        await input.press('Enter');
        await esperarCargaOverlay(this.page);
    }

    async filtrarPorMontoTotal(comparador: string, valor: string): Promise<void> {
        await this.page.locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes-header:grid-header_v-input:MontoTotalFormateado"]',
        ).click();

        const dropdownComparador = this.page.locator('.v-select-header-form');
        await dropdownComparador.click();

        const opcionesDropdown = this.page.locator('.v-select-base-options.is-open');
        await opcionesDropdown.waitFor({state: 'visible'});

        await opcionesDropdown
            .locator('.v-select-form-option')
            .getByText(comparador, {exact: true})
            .click();

        const inputValor = this.page.locator(
            '[id="pv_common_cmp-card-filter-number:filtro_v-input:valor"]',
        );
        await inputValor.fill(valor);
        await this.page.locator('[id="pv_comprobantes_cmp-grid-comprobantes-header:grid-header_cmp-card-filter-number:aplicar-filtro"]').click();
        await esperarCargaOverlay(this.page);
    }
}
