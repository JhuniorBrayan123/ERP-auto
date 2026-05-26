/**
 * Page Object para la gestión de Caja en Punto de Venta.
 *
 * Soporta múltiples cajas mediante el parámetro `nombreCaja` en el constructor.
 * Por defecto opera sobre 'caja-auto', pero se puede pasar cualquier nombre
 * (ej. 'Caja de venta') para operar sobre otra caja.
 *
 * Locators reales del codegen:
 * - Aperturar caja: getByRole('button', { name: 'Aperturar caja' })
 * - Apertura: getByRole('button', { name: 'Apertura', exact: true })
 * - Sí, aperturar: getByRole('button', { name: 'Sí, aperturar' })
 * - Continuar vendiendo: getByRole('button', { name: 'Continuar vendiendo' })
 */
import {expect, type Page} from '@playwright/test';
import {throwFunctionalError} from '../../utils/functional-error';
import {FUNCTIONAL_CATALOG} from '../../utils/functional-catalog';

export class CajaPage {
    /**
     * @param page - Instancia de Page de Playwright
     * @param nombreCaja - Nombre de la caja objetivo (default: 'caja-auto').
     *                     Pasar otro nombre (e.g. 'Caja de venta') para operar
     *                     sobre una caja diferente.
     */
    constructor(
        private readonly page: Page,
        private readonly nombreCaja: string = 'caja-auto',
    ) {
    }

    // ─── Navegación a caja ────────────────────────────────────────────

    /**
     * Busca la tarjeta de la caja por su nombre y hace scroll hacia ella.
     */
    async scrollATarjetaCaja(): Promise<void> {
        // Busca cualquier div que contenga el nombre de la caja (la tarjeta contenedora)
        const tarjeta = this.page.locator('div')
            .filter({has: this.page.getByText(this.nombreCaja, {exact: false})})
            .first();
        await tarjeta.waitFor({state: 'attached', timeout: 15_000}).catch(() => {});
        await tarjeta.scrollIntoViewIfNeeded({timeout: 10_000}).catch(() => {});
    }

    // ─── Flujo de apertura ────────────────────────────────────────────

    /** Click en "Aperturar caja" cuando la caja está cerrada */
    async clickAperturarCaja(): Promise<void> {
        await this.page.getByRole('button', {name: 'Aperturar caja'}).first().click();
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
     */
    async abrirCajaCompleta(): Promise<void> {
        await this.clickAperturarCaja();
        await this.clickApertura();
        await this.clickSiAperturar();
    }

    // ─── Continuar vendiendo ──────────────────────────────────────────

    /** Click en "Continuar vendiendo" cuando la caja ya está abierta */
    async continuarVendiendo(): Promise<void> {
        await this.page.getByRole('button', {name: 'Continuar vendiendo'}).first().click();
        await expect(
            this.page.locator('.v-select-header-small .v-text').first()
        ).not.toHaveText('Seleccionar', {timeout: 15_000});
    }

    // ─── Flujo principal ─────────────────────────────────────────────

    /**
     * Asegura que la caja esté abierta:
     * 1. Hace scroll a la tarjeta de la caja
     * 2. Si hay botón "Continuar vendiendo" → click (caja ya abierta)
     * 3. Si no, click "Aperturar caja" → confirma modales → caja abierta
     * 4. Espera a que el POS esté listo
     */
    async asegurarCajaAbierta(): Promise<void> {
        try {
            await this.scrollATarjetaCaja();

            // Intentar "Continuar vendiendo" primero (caja ya abierta)
            const btnContinuar = this.page.getByRole('button', {name: 'Continuar vendiendo'}).first();
            const continuarVisible = await btnContinuar.isVisible({timeout: 8_000}).catch(() => false);

            if (continuarVisible) {
                console.log(`[CajaPage] Caja "${this.nombreCaja}" ya abierta — continuando venta`);
                await btnContinuar.click();
            } else {
                // Caja cerrada → aperturar
                console.log(`[CajaPage] Caja "${this.nombreCaja}" cerrada — aperturando`);
                await this.abrirCajaCompleta();
            }

            // Esperar a que el POS esté listo después de entrar a la caja
            await expect(
                this.page.locator('.v-select-header-small .v-text').first()
            ).not.toHaveText('Seleccionar', {timeout: 20_000});
        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.abrirCaja,
                cause: error,
            });
        }
    }
}
