import { expect, type Page } from '@playwright/test';
import type { EmisionResult } from '../../helpers/PuntoVenta/emision.types';

export class ComprobanteDetallePage {
    constructor(private readonly page: Page) {}

    async capturarSerieCorrelativo(seriePrefix: string): Promise<EmisionResult> {
        const textoComprobante = await this.page
            .getByText(`${seriePrefix}-`)
            .innerText();

        const [serie = '', correlativo = ''] = textoComprobante.split('-');

        return {
            serie: serie.trim(),
            correlativo: correlativo.trim(),
            comprobanteId: 0,
        };
    }

    async validarEstadoEmitido(): Promise<void> {
        await expect(
            this.page.getByText(/emitido/i).first(),
        ).toBeVisible({ timeout: 10_000 });
    }

    async validarSinErrorEmision(): Promise<void> {
        await expect(
            this.page.getByText(/error al emitir/i),
        ).not.toBeVisible({ timeout: 5_000 });
    }

    async volverAlPuntoDeVenta(): Promise<void> {
        await this.page.getByRole('button', { name: 'Nueva Venta' }).click();
    }
}
