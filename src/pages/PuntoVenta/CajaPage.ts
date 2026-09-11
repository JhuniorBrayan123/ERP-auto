import { expect, type Page } from '@playwright/test';
import { throwFunctionalError } from '@utils/functional-error';
import { FUNCTIONAL_CATALOG } from '@utils/functional-catalog';
import { esperarCargaOverlay } from '@utils/wait-helpers';

export class CajaPage {

    constructor(
        private readonly page: Page,
        private readonly nombreCaja: string = 'caja-auto',
    ) {}

    get nombreCajaActiva(): string {
        return this.nombreCaja;
    }

    private get tarjetaCaja() {
        return this.page
            .locator('.detalle')
            .filter({ hasText: this.nombreCaja })
            .first();
    }

    private get btnContinuarVendiendo() {
        return this.tarjetaCaja.getByRole(
            'button',
            { name: 'Continuar vendiendo' }
        );
    }

    private get btnAperturarCaja() {
        return this.tarjetaCaja.getByRole(
            'button',
            { name: 'Aperturar caja' }
        );
    }

    private get selectorCaja() {
        return this.page
            .locator('.v-select-header-small .v-text')
            .first();
    }

    async scrollATarjetaCaja(): Promise<void> {
        await expect(this.tarjetaCaja).toBeVisible({
            timeout: 20_000
        });

        await this.tarjetaCaja.scrollIntoViewIfNeeded();
    }

    async clickAperturarCaja(): Promise<void> {
        await this.btnAperturarCaja.click();
    }

    async clickApertura(): Promise<void> {
        await this.page
            .getByRole('button', {
                name: 'Apertura',
                exact: true
            })
            .click();
    }

    async clickSiAperturar(): Promise<void> {
        await this.page
            .getByRole('button', {
                name: 'Sí, aperturar'
            })
            .click();
    }

    async abrirCajaCompleta(): Promise<void> {
        await this.clickAperturarCaja();
        await this.clickApertura();
        await this.clickSiAperturar();

        await esperarCargaOverlay(this.page);
    }

    async continuarVendiendo(): Promise<void> {
        await this.btnContinuarVendiendo.click();

        // Validar que el click realmente navegó fuera de la lista de cajas
        // y que la vista de venta terminó de cargar — no alcanza con la URL
        // sola: sin esperar el overlay, el resto del flujo puede seguir
        // interactuando con la pantalla de cajas todavía visible.
        await this.page.waitForURL((url) => !url.pathname.includes('/cajas'), {
            timeout: 20_000,
        });
        await esperarCargaOverlay(this.page);

        await expect(this.selectorCaja)
            .not.toHaveText('Seleccionar', {
                timeout: 30_000
            });
    }

    async asegurarCajaAbierta(): Promise<void> {
        try {
            await this.scrollATarjetaCaja();

            // Esperar a que el ERP defina el estado de la caja.
            await expect(
                this.btnContinuarVendiendo
                    .or(this.btnAperturarCaja)
                    .first()
            ).toBeVisible({
                timeout: 20_000
            });

            // Aquí isVisible() sí está bien:
            // ya esperamos previamente que uno de los dos estados exista.
            const cajaAbierta =
                await this.btnContinuarVendiendo.isVisible();

            if (cajaAbierta) {

                console.log(
                    `[CajaPage] Caja "${this.nombreCaja}" ya abierta — continuando venta`
                );

                await this.continuarVendiendo();

            } else {

                console.log(
                    `[CajaPage] Caja "${this.nombreCaja}" cerrada — aperturando`
                );

                await this.abrirCajaCompleta();

                await this.page.waitForURL((url) => !url.pathname.includes('/cajas'), {
                    timeout: 20_000,
                });

                await expect(this.selectorCaja)
                    .not.toHaveText('Seleccionar', {
                        timeout: 30_000
                    });
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