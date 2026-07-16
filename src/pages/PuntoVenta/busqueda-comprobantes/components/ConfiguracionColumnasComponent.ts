import {type Page} from '@playwright/test';
import {esperarCargaOverlay} from "@utils/wait-helpers";
import type {BcCategoria} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

export class ConfiguracionColumnasComponent {
    constructor(private readonly page: Page) {
    }

    async abrirConfiguracionColumnas(): Promise<void> {
        await this.page.locator('.v-icon-head-plus > .icon').click();
        await this.page.locator('.container-dropdown-elements').waitFor({state: 'attached', timeout: 5000});
    }

    async configurarColumna(categoria: string, campoId: string, activar: boolean): Promise<boolean> {
        const itemId = `pv_cmp-comprobantes:cmp-grid-comprobantes-header-options_select-columns:item-${categoria}-${campoId}`;
        const container = this.page.locator(`[id="${itemId}"]`);

        if (await container.count() === 0) return false;

        const wrapper = container.locator('.v-checkbox');
        const checkedAttr = await wrapper.getAttribute('checked').catch(() => null);
        const isChecked = checkedAttr === 'true';

        if (activar && !isChecked) {
            await container.scrollIntoViewIfNeeded();
            await container.locator('label').click({force: true});
            return true;
        }
        if (!activar && isChecked) {
            await container.scrollIntoViewIfNeeded();
            await container.locator('label').click({force: true});
            return true;
        }

        return false;
    }

    async guardarConfiguracionColumnas(): Promise<void> {
        await this.page.locator(
            '[id="pv_cmp-comprobantes:cmp-grid-comprobantes-header-options_v-button:guardar-configuracion"]',
        ).click();
        await esperarCargaOverlay(this.page);
    }

    async activarTodasLasColumnas(): Promise<void> {
        const columnasPorCategoria: Record<BcCategoria, string[]> = {
            TODOS: [
                'NumeroDocumento', 'FCreacion', 'FEmision', 'UsuarioCreador',
                'Peso', 'CondicionesPago', 'MetodosPago', 'Monedas',
                'Subtotal', 'IGV', 'Mtotal', 'MontoPagado',
                'MontoAdeudado', 'EstadoPago', 'ListEstadosSunat',
            ],
            VENTAS: [
                'NumeroDocumento', 'IdRazonSocial', 'FEmision', 'IdsCajas',
                'Despacho', 'CondicionesPago', 'MetodosPago', 'Monedas',
                'ListEstados', 'EstadoPago', 'ListEstadosSunat',
            ],
            FACTURACION: [
                'NumeroDocumento', 'IdRazonSocial', 'FEmision', 'IdsCajas',
                'Despacho', 'CondicionesPago', 'MetodosPago', 'Monedas',
                'ListEstados', 'EstadoPago', 'ListEstadosSunat',
            ],
            GUIAS: [
                'NumeroDocumento', 'IdRazonSocial', 'FEmision', 'IdsCajas',
                'Despacho', 'CondicionesPago', 'MetodosPago', 'Monedas',
                'ListEstados', 'EstadoPago', 'ListEstadosSunat',
            ],
            COTIZACIONES: [
                'NumeroDocumento', 'IdRazonSocial', 'FEmision', 'IdsCajas',
                'Despacho', 'CondicionesPago', 'MetodosPago', 'Monedas',
                'ListEstados', 'EstadoPago', 'ListEstadosSunat',
            ],
            PEDIDOS: [
                'NumeroDocumento', 'IdRazonSocial', 'FEmision', 'IdsCajas',
                'Despacho', 'CondicionesPago', 'MetodosPago', 'Monedas',
                'ListEstados', 'EstadoPago', 'ListEstadosSunat',
            ],
        };

        
        const {ComprobantesFiltrosComponent} = await import('./ComprobantesFiltrosComponent.js');
        const filtros = new ComprobantesFiltrosComponent(this.page);

        for (const [categoria, columnas] of Object.entries(columnasPorCategoria)) {
            await filtros.seleccionarCategoria(categoria as BcCategoria);
            await this.abrirConfiguracionColumnas();

            let changed = false;
            for (const campoId of columnas) {
                const toggled = await this.configurarColumna(categoria, campoId, true);
                if (toggled) changed = true;
            }

            if (changed) {
                await this.guardarConfiguracionColumnas();
            } else {
                await this.page.locator('.v-icon-head-plus > .icon').click();
            }
        }

        await filtros.seleccionarCategoria('TODOS');
    }
}
