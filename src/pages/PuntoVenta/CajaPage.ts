/**
 * Page Object para la gestión de Caja en Punto de Venta.
 *
 * Locators reales del codegen:
 * - Aperturar caja: getByRole('button', { name: 'Aperturar caja' })
 * - Apertura: getByRole('button', { name: 'Apertura', exact: true })
 * - Sí, aperturar: getByRole('button', { name: 'Sí, aperturar' })
 * - Continuar vendiendo: getByRole('button', { name: 'Continuar vendiendo' })
 */
import {expect, type Page} from '@playwright/test';

export class CajaPage {
    constructor(private readonly page: Page) {
    }

    // ─── Flujo de apertura ────────────────────────────────────────────

    /** Click en "Aperturar caja" cuando la caja está cerrada */
    async clickAperturarCaja(): Promise<void> {
        await this.page.getByRole('button', {name: 'Aperturar caja'}).click();
    }

    /** Confirma apertura en el modal */
    async clickApertura(): Promise<void> {
        await this.page.getByRole('button', {name: 'Apertura', exact: true}).click();
    }

    /** Confirma el "Sí, aperturar" final */
    async clickSiAperturar(): Promise<void> {
        await this.page.getByRole('button', {name: 'Sí, aperturar'}).click();
    }

    /**
     * Flujo completo de apertura de caja.
     * Solo ejecutar si la caja está cerrada.
     */
    async abrirCajaCompleta(): Promise<void> {
        await this.clickAperturarCaja();
        await this.clickApertura();
        await this.clickSiAperturar();
    }

    // ─── Continuar vendiendo ──────────────────────────────────────────

    /** Click en "Continuar vendiendo" cuando la caja ya está abierta */
    async continuarVendiendo(): Promise<void> {
        await this.page.getByRole('button', {name: 'Continuar vendiendo'}).click();
        await expect(
            this.page.locator('.v-select-header-small .v-text').first()
        ).not.toHaveText('Seleccionar', {timeout: 15_000});
    }

    // ─── Detección de estado ──────────────────────────────────────────

    /**
     * Detecta si la caja necesita apertura o ya está abierta.
     * Retorna 'cerrada' si ve "Aperturar caja", 'abierta' si ve "Continuar vendiendo".
     */
    async detectarEstadoCaja(): Promise<'abierta' | 'cerrada' | 'desconocido'> {
        try {
            await this.page.waitForSelector('button:has-text("Aperturar caja"), button:has-text("Continuar vendiendo")', {timeout: 8_000})
        } catch {
            return 'desconocido'
        }
        const btnAperturar = this.page.getByRole('button', {name: 'Aperturar caja'});
        const btnContinuar = this.page.getByRole('button', {name: 'Continuar vendiendo'});

        const [aperturarVisible, continuarVisible] = await Promise.all([
            btnAperturar.isVisible({timeout: 3_000}).catch(() => false),
            btnContinuar.isVisible({timeout: 3_000}).catch(() => false),
        ]);

        if (aperturarVisible) return 'cerrada';
        if (continuarVisible) return 'abierta';
        return 'desconocido';
    }

    /**
     * Asegura que la caja esté abierta: si está cerrada la abre,
     * si ya está abierta continúa vendiendo.
     */
    async asegurarCajaAbierta(): Promise<void> {
        const estado = await this.detectarEstadoCaja();
        console.log("Estado detectado")
        if (estado === 'cerrada') {
            await this.abrirCajaCompleta();
        } else if (estado === 'abierta') {
            await this.continuarVendiendo();
        }
    }
}
