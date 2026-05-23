/**
 * Page Object para la selección del tipo de comprobante en PuntoVenta.
 *
 * Locators reales del codegen:
 * - BOLETA selector: locator con id ...v-select:tipo-comprobante + v-option:opcion-1004
 * - FACTURA selector: locator con id ...v-select:tipo-comprobante + v-option:opcion-1003
 * - NOTA DE VENTA: opcion-2016
 *
 * IDs de tipo de comprobante del sistema:
 * - 1003 = FACTURA
 * - 1004 = BOLETA DE VENTA
 * - 1005 = NOTA DE CRÉDITO
 * - 1006 = NOTA DE DÉBITO
 * - 2016 = NOTA DE VENTA
 */
import { expect, type Page } from '@playwright/test';
import type { TipoComprobante } from '../../helpers/PuntoVenta/emision.types';
import { throwFunctionalError } from '../../utils/functional-error';
import { FUNCTIONAL_CATALOG } from '../../utils/functional-catalog';

/** Mapeo de tipo de comprobante a ID del sistema */
const TIPO_COMPROBANTE_ID: Record<TipoComprobante, number> = {
    'BOLETA': 1004,
    'FACTURA': 1003,
    'NOTA DE VENTA': 2016,
    'COTIZACIÓN': 3007,
    'PEDIDO': 2011,
};

export class ComprobantePage {
    constructor(private readonly page: Page) {}

    /**
     * Abre el selector de tipo de comprobante clickeando el tipo actual visible.
     */
    async abrirSelectorTipo(): Promise<void> {
        // El primer click abre el dropdown — hacemos click en el texto del tipo actual
        await this.page.getByText('BOLETA').first().click();
    }

    /**
     * Selecciona un tipo de comprobante del dropdown.
     */
    async seleccionarTipoComprobante(tipo: TipoComprobante): Promise<void> {
        try {
            const id = TIPO_COMPROBANTE_ID[tipo];
            // El dropdown usa IDs con el patrón: v-option:opcion-{id}
            const optionLocator = this.page.locator(
                `[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-${id}"]`,
            );

            // Si la opción ya tiene el texto visible, puede que necesitemos abrir el dropdown primero
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

    /** Seleccionar boleta directamente */
    async seleccionarBoleta(): Promise<void> {
        await this.seleccionarTipoComprobante('BOLETA');
    }

    /** Seleccionar factura directamente */
    async seleccionarFactura(): Promise<void> {
        await this.seleccionarTipoComprobante('FACTURA');
    }

    /** Seleccionar nota de venta directamente */
    async seleccionarNotaVenta(): Promise<void> {
        await this.seleccionarTipoComprobante('NOTA DE VENTA');
    }

    /** Seleccionar cotización directamente */
    async seleccionarCotizacion(): Promise<void> {
        await this.seleccionarTipoComprobante('COTIZACIÓN');
    }

    /** Seleccionar pedido directamente */
    async seleccionarPedido(): Promise<void> {
        await this.seleccionarTipoComprobante('PEDIDO');
    }
}
