import {type Page} from '@playwright/test';
import type {TipoComprobante} from '@app-types/emision.types';
import {throwFunctionalError} from '@utils/functional-error';
import {FUNCTIONAL_CATALOG} from '@utils/functional-catalog';
import {esperarCargaOverlaySiVisible, recargarSiHayError} from "@utils/wait-helpers";

const TIPO_COMPROBANTE_ID: Record<TipoComprobante, number> = {
    'BOLETA': 1004,
    'FACTURA': 1003,
    'NOTA DE VENTA': 2016,
    'COTIZACIÓN': 3007,
    'PEDIDO': 2011,
    'NOTA DE CRÉDITO': 1005,
    'NOTA DE DÉBITO': 1006
};

export class ComprobantePage {
    constructor(private readonly page: Page) {
    }

    async abrirSelectorTipo(): Promise<void> {
        await this.page.getByText('BOLETA').first().click();
    }

    async seleccionarTipoComprobante(tipo: TipoComprobante): Promise<void> {
        try {
            const id = TIPO_COMPROBANTE_ID[tipo];

            const optionLocator = this.page.locator(
                `[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-${id}"]`,
            );

            await this.abrirSelectorTipo();
            await optionLocator.getByText(tipo).click();
        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.seleccionarComprobante,
                cause: error,
            });
        }
    }

    async seleccionarBoleta(): Promise<void> {
        await esperarCargaOverlaySiVisible(this.page);
        await this.seleccionarTipoComprobante('BOLETA');
    }

    async seleccionarFactura(): Promise<void> {
        await esperarCargaOverlaySiVisible(this.page);
        await this.seleccionarTipoComprobante('FACTURA');
    }

    async seleccionarNotaVenta(): Promise<void> {
        await recargarSiHayError(this.page);
        await this.seleccionarTipoComprobante('NOTA DE VENTA');
    }

    async seleccionarCotizacion(): Promise<void> {
        await esperarCargaOverlaySiVisible(this.page);
        await this.seleccionarTipoComprobante('COTIZACIÓN');
    }

    async seleccionarPedido(): Promise<void> {
        await esperarCargaOverlaySiVisible(this.page);
        await this.seleccionarTipoComprobante('PEDIDO');
    }

    async seleccionarNotaCredito(): Promise<void> {
        await esperarCargaOverlaySiVisible(this.page);
        await this.seleccionarTipoComprobante('NOTA DE CRÉDITO');
    }

    async seleccionarNotaDebito(): Promise<void> {
        await esperarCargaOverlaySiVisible(this.page);
        await this.seleccionarTipoComprobante('NOTA DE DÉBITO');
    }
}
