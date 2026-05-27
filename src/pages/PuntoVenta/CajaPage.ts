import {expect, type Page} from '@playwright/test';
import {throwFunctionalError} from '@utils/functional-error';
import {FUNCTIONAL_CATALOG} from '@utils/functional-catalog';

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
     * Retorna el locator de la tarjeta de la caja exacta buscando SOLO por su nombre.
     * Esto evita que los clics afecten a otras cajas visibles en pantalla.
     */
    private get tarjetaCaja() {
        return this.page.locator('.detalle')
            .filter({ hasText: this.nombreCaja })
            .first();
    }

    async scrollATarjetaCaja(): Promise<void> {
        await this.tarjetaCaja.waitFor({state: 'attached', timeout: 15_000}).catch(() => {
        });
        await this.tarjetaCaja.scrollIntoViewIfNeeded({timeout: 10_000}).catch(() => {
        });
    }

    // ─── Flujo de apertura ────────────────────────────────────────────

    /** Click en "Aperturar caja" cuando la caja está cerrada */
    async clickAperturarCaja(): Promise<void> {
        await this.tarjetaCaja.getByRole('button', {name: 'Aperturar caja'}).click();
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
        await this.tarjetaCaja.getByRole('button', {name: 'Continuar vendiendo'}).click();
        await expect(
            this.page.locator('.v-select-header-small .v-text').first()
        ).not.toHaveText('Seleccionar', {timeout: 15_000});
    }

    async asegurarCajaAbierta(): Promise<void> {
        try {
            await this.scrollATarjetaCaja();
            // Intentar "Continuar vendiendo" primero (caja ya abierta)
            const btnContinuar = this.tarjetaCaja.getByRole('button', {name: 'Continuar vendiendo'});
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
