import {expect, type Page} from '@playwright/test';
import {throwFunctionalError} from '@utils/functional-error';
import {FUNCTIONAL_CATALOG} from '@utils/functional-catalog';
import {esperarCargaOverlay} from "@utils/wait-helpers";

export class CajaPage {

    constructor(
        private readonly page: Page,
        private readonly nombreCaja: string = 'caja-auto',
    ) {
    }

    
    get nombreCajaActiva(): string {
        return this.nombreCaja;
    }

    private get tarjetaCaja() {
        return this.page.locator('.detalle')
            .filter({hasText: this.nombreCaja})
            .first();
    }

    async scrollATarjetaCaja(): Promise<void> {
        await this.tarjetaCaja.waitFor({state: 'attached', timeout: 20_000}).catch(() => {
        });
        await this.tarjetaCaja.scrollIntoViewIfNeeded({timeout: 15_000}).catch(() => {
        });
    }

    async clickAperturarCaja(): Promise<void> {
        await this.tarjetaCaja.getByRole('button', {name: 'Aperturar caja'}).click();
    }

    async clickApertura(): Promise<void> {
        await this.page.getByRole('button', {name: 'Apertura', exact: true}).click();
    }

    async clickSiAperturar(): Promise<void> {
        await this.page.getByRole('button', {name: 'Sí, aperturar'}).click();
    }

    async abrirCajaCompleta(): Promise<void> {
        await this.clickAperturarCaja();
        await this.clickApertura();
        await this.clickSiAperturar();
        await esperarCargaOverlay(this.page)
    }

    async continuarVendiendo(): Promise<void> {
        await this.tarjetaCaja.getByRole('button', {name: 'Continuar vendiendo'}).click();
        await expect(
            this.page.locator('.v-select-header-small .v-text').first()
        ).not.toHaveText('Seleccionar', {timeout: 30_000});
    }

    async asegurarCajaAbierta(): Promise<void> {
        try {
            await this.scrollATarjetaCaja();

            const btnContinuar = this.tarjetaCaja.getByRole('button', {name: 'Continuar vendiendo'});
            const continuarVisible = await btnContinuar.isVisible({timeout: 8_000}).catch(() => false);

            if (continuarVisible) {
                console.log(`[CajaPage] Caja "${this.nombreCaja}" ya abierta — continuando venta`);
                await btnContinuar.click();
            } else {

                console.log(`[CajaPage] Caja "${this.nombreCaja}" cerrada — aperturando`);
                await this.abrirCajaCompleta();
            }

            await expect(
                this.page.locator('.v-select-header-small .v-text').first()
            ).not.toHaveText('Seleccionar', {timeout: 30_000});
        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.abrirCaja,
                cause: error,
            });
        }
    }
}
