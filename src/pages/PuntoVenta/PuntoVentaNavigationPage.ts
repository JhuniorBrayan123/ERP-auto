import { expect, type Page } from '@playwright/test';
import { throwFunctionalError } from '@utils/functional-error';
import { FUNCTIONAL_CATALOG } from '@utils/functional-catalog';
import {esperarCargaOverlay} from "@utils/wait-helpers";

export class PuntoVentaNavigationPage {

    constructor(private readonly page: Page) {}

    async navegarAPuntoDeVenta(): Promise<void> {
        try {
            const ventasYCompras =
                this.page.getByText('Ventas y compras', { exact: true });

            const nuevaVenta =
                this.page.getByText('Nueva venta', { exact: true });
            const accionCaja =
                this.page.getByRole('button', {
                    name: /^(Aperturar caja|Continuar vendiendo)$/
                }).first();

            await esperarCargaOverlay(this.page);

            await expect(ventasYCompras).toBeVisible({
                timeout: 20_000
            });

            await ventasYCompras.click();

            await expect(nuevaVenta).toBeVisible({
                timeout: 10_000
            });
            await nuevaVenta.click();

            await esperarCargaOverlay(this.page);

            await expect(accionCaja).toBeVisible({
                timeout: 20_000
            });

        } catch (error) {
            await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.navegarAPdV,
                cause: error,
            });
        }
    }
}
