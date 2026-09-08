import {type Page} from '@playwright/test';
import type {EmisionResult} from '@helpers/PuntoVenta/emision.types';
import {esperarCargaOverlaySiVisible} from '@utils/wait-helpers';

export class AdelantosModalComponent {
    constructor(private readonly page: Page) {
    }

    async filtrarAdelanto(emision: EmisionResult | null): Promise<void> {
        if (!emision) throw new Error('No hay emisión capturada para filtrar adelanto');

        const seriesPromise = this.page.waitForResponse(
            (resp) =>
                resp.url().includes('entidades/series') &&
                resp.url().includes('idtipodocumento=2016') &&
                resp.status() === 200,
            {timeout: 15_000},
        );

        await seriesPromise;

        const input = this.page.locator(
            '[id="pv_punto-venta_cmp_venta_pedido:modals_cmp-gestion-adelantos__v-input:busqueda-serie-correlativo"]'
        );

        await input.click();
        await input.fill(emision.correlativo);
        await input.press('Enter');
        await esperarCargaOverlaySiVisible(this.page);
        await seriesPromise;

        console.log(`   Adelanto filtrado: correlativo ${emision.correlativo}`);
    }

    async filtrarAdelantoFactura(emision: EmisionResult | null): Promise<void> {
        if (!emision) throw new Error('No hay emisión capturada para filtrar adelanto');

        await this.page.locator('[id="_div:dropdown"]').getByText('Serie').click();
        await this.page.locator('[id*="opcion-serie"]').filter({hasText: 'F001'}).first().click();

        const inputCorrelativo = this.page.getByRole('textbox', {name: 'Correlativo'});
        await inputCorrelativo.click();
        await inputCorrelativo.fill(emision.correlativo);

        await inputCorrelativo.press('Enter');

        const referenciaUnica = `F001-${emision.correlativo}`;
        const filaEsperada = this.page.locator('tr').filter({hasText: referenciaUnica}).first();
        await filaEsperada.waitFor({state: 'visible', timeout: 15_000});

        const checkbox = this.page.locator('[id="pv_punto-venta_cmp_venta_pedido:modals_cmp-gestion-adelantos_v-checkbox:agregar-adelanto-0"]');
        await checkbox.click({force: true});
        await this.page.getByRole('button', {name: 'Aceptar'}).click();

        console.log(`   Adelanto factura filtrado y seleccionado: F001-${emision.correlativo}`);
    }
}
