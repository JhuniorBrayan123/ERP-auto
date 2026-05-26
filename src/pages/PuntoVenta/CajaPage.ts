/**
 * Page Object para la gestión de Caja en Punto de Venta.
 *
 * Locators reales del codegen:
 * - Aperturar caja: getByRole('button', { name: 'Aperturar caja' })
 * - Apertura: getByRole('button', { name: 'Apertura', exact: true })
 * - Sí, aperturar: getByRole('button', { name: 'Sí, aperturar' })
 * - Continuar vendiendo: getByRole('button', { name: 'Continuar vendiendo' })
 */
import {expect, Locator, type Page} from '@playwright/test';
import {throwFunctionalError} from '@utils/functional-error';
import {FUNCTIONAL_CATALOG} from '@utils/functional-catalog';

export class CajaPage {
    constructor(private readonly page: Page) {
    }

    // ─── Locators específicos por caja ────────────────────────────────

    private getBotonPorCaja(nombreCaja: string, nombreBoton: string | RegExp): Locator {
        return this.page.locator('div')
            .filter({has: this.page.getByText(nombreCaja, {exact: false})})
            .filter({has: this.page.getByRole('button', {name: nombreBoton})})
            .last()
            .getByRole('button', {name: nombreBoton});
    }

    // ─── Flujo de apertura ────────────────────────────────────────────

    /** Click en "Aperturar caja" cuando la caja está cerrada */
    async clickAperturarCaja(): Promise<void> {
        await this.getBotonPorCaja('caja-auto', 'Aperturar caja').click();
    }

    /** Confirma apertura en el modal */
    async clickApertura(): Promise<void> {
        // Este botón está dentro del modal, no en la tarjeta de la caja, así que el getByRole directo funciona
        await this.page.getByRole('button', {name: 'Apertura', exact: true}).click();
    }

    /** Confirma el "Sí, aperturar" final */
    async clickSiAperturar(): Promise<void> {
        // También dentro del modal
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
        await this.getBotonPorCaja('caja-auto', 'Continuar vendiendo').click();
        await expect(
            this.page.locator('.v-select-header-small .v-text').first()
        ).not.toHaveText('Seleccionar', {timeout: 15_000});
    }

    async detectarEstadoCaja(): Promise<'abierta' | 'cerrada' | 'desconocido'> {
        // Esperar a que el overload/spinner desaparezca antes de buscar botones
        const overload = this.page.locator('[id="cmn_cmp-overload:loading"]');
        await overload.waitFor({state: 'visible', timeout: 3_000}).catch(() => {
        });
        await overload.waitFor({state: 'hidden', timeout: 15_000}).catch(() => {
        });

        const btnAperturar = this.getBotonPorCaja('caja-auto', 'Aperturar caja');
        const btnContinuar = this.getBotonPorCaja('caja-auto', 'Continuar vendiendo');

        try {
            // Esperamos a que cualquiera de los dos botones de caja-auto sea visible usando .or() nativo de Playwright
            await btnAperturar.or(btnContinuar).waitFor({state: 'visible', timeout: 8_000});
        } catch {
            return 'desconocido';
        }

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
        try {
            const estado = await this.detectarEstadoCaja();
            console.log(`[CajaPage] Estado detectado: ${estado}`);
            if (estado === 'cerrada') {
                await this.abrirCajaCompleta();
            } else if (estado === 'abierta') {
                await this.continuarVendiendo();
            } else {
                throw new Error('No se pudo determinar el estado de la caja (spinner no terminó o botones no encontrados)');
            }
        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.abrirCaja,
                cause: error,
            });
        }
    }
}
