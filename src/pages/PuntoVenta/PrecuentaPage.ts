/**
 * Page Object para la vista previa / precuenta en PuntoVenta.
 *
 * Locators reales del codegen:
 * - Precuenta: getByRole('button', { name: 'PRECUENTA' })
 * - Vista previa: getByRole('button', { name: 'VISTA PREVIA' })
 * - Cerrar vista previa: locator('.icon-close')
 * - Zoom: locator('.control > .plus')
 */
import { expect, type Page } from '@playwright/test';

export class PrecuentaPage {
    constructor(private readonly page: Page) {}

    // ─── Precuenta (ticket) ───────────────────────────────────────────

    async abrirPrecuenta(): Promise<void> {
        await this.page.getByRole('button', { name: 'PRECUENTA' }).click();
    }

    // ─── Vista previa (A4) ────────────────────────────────────────────

    async abrirVistaPrevia(): Promise<void> {
        await this.page.getByRole('button', { name: 'VISTA PREVIA' }).click();
    }

    async cerrarVistaPrevia(): Promise<void> {
        await this.page.locator('.icon-close').click();
    }

    async zoomIn(veces: number = 1): Promise<void> {
        for (let i = 0; i < veces; i++) {
            await this.page.locator('.control > .plus').click();
        }
    }

    // ─── Verificaciones ───────────────────────────────────────────────

    async validarTotalVisible(totalTexto: string): Promise<void> {
        await expect(this.page.getByText(totalTexto)).toBeVisible();
    }

    async validarItemEnPrecuenta(nombreItem: string): Promise<void> {
        await expect(this.page.getByText(nombreItem)).toBeVisible();
    }
}
