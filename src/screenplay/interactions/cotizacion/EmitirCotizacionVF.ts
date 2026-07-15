import { type Page } from '@playwright/test';
import type { EmisionResult } from '@app-types/emision.types';
import { CotizacionTargets } from '@screenplay/targets/cotizacion/CotizacionTargets';

export interface ResultadoEmisionVF extends EmisionResult {
    numero: string;
}

/**
 * Interaction: Click EMITIR en cotización + capturar serie/correlativo vía API intercept.
 * Patrón idéntico a ConfirmarPago pero sin flujo de pago.
 */
export const EmitirCotizacionVF = () => {
    const fn = async (page: Page): Promise<ResultadoEmisionVF> => {
        const emisionPromise = page.waitForResponse(
            (resp) =>
                resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            { timeout: 45_000 }
        );

        await CotizacionTargets.btnEmitir(page).click();

        const response = await emisionPromise;
        const body = await response.json();

        const nombrePdf: string = body.FilePdf?.Nombre ?? '';
        const serie = nombrePdf.split('-')[0] ?? '';
        const correlativo = String(body.CorrelativoDocumento ?? '');
        const comprobanteId = body.IdComprobante ?? 0;
        const numero = `${serie}-${correlativo.padStart(8, '0')}`;

        return { serie, correlativo, comprobanteId, numero };
    };
    fn.displayName = 'Emitir cotización desde Vista Facturación';
    return fn;
};
