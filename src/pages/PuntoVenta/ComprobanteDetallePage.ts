/**
 * Page Object para el detalle del comprobante post-emisión.
 *
 * Maneja SOLO el modal de éxito post-pago donde aparece serie/correlativo
 * y las acciones inmediatas (Nueva Venta, capturar datos).
 *
 * Los métodos de búsqueda de comprobantes, bitácora y ver comprobante
 * ahora viven en BusquedaComprobantesPage.ts.
 *
 * Locators reales del codegen:
 * - Serie+correlativo visible como texto (ej: "F001-5", "B001-3", "NV01-1")
 * - Nueva Venta: getByRole('button', { name: 'Nueva Venta' })
 */
import { expect, type Page } from '@playwright/test';
import type { EmisionResult } from '../../helpers/PuntoVenta/emision.types';

export class ComprobanteDetallePage {
    constructor(private readonly page: Page) {}

    // ─── Captura de datos post-emisión ────────────────────────────────

    /**
     * Captura serie y correlativo del comprobante recién emitido.
     * El ERP muestra el número (ej: "F001-5") en el modal de éxito post-pago.
     *
     * @param seriePrefix - Prefijo de serie esperado (ej: 'F001', 'B001', 'NV01')
     */
    async capturarSerieCorrelativo(seriePrefix: string): Promise<EmisionResult> {
        const textoComprobante = await this.page
            .getByText(`${seriePrefix}-`)
            .innerText();

        const [serie = '', correlativo = ''] = textoComprobante.split('-');

        return {
            serie: serie.trim(),
            correlativo: correlativo.trim(),
            comprobanteId: 0, // Se obtiene vía API
        };
    }

    // ─── Validaciones Capa 1: estado inmediato ────────────────────────

    /** Valida estado EMITIDO en el ERP */
    async validarEstadoEmitido(): Promise<void> {
        await expect(
            this.page.getByText(/emitido/i).first(),
        ).toBeVisible({ timeout: 10_000 });
    }

    /** Valida que NO se muestre error de emisión */
    async validarSinErrorEmision(): Promise<void> {
        await expect(
            this.page.getByText(/error al emitir/i),
        ).not.toBeVisible({ timeout: 5_000 });
    }

    // ─── Navegación post-emisión ──────────────────────────────────────

    /** Click en "Nueva Venta" en el modal post-emisión */
    async volverAlPuntoDeVenta(): Promise<void> {
        await this.page.getByRole('button', { name: 'Nueva Venta' }).click();
    }
}
