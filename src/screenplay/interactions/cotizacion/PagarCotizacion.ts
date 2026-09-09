import { type Page } from '@playwright/test';
import { CotizacionTargets } from '@screenplay/targets/cotizacion/CotizacionTargets';
import { esperarCargaOverlay } from '@utils/wait-helpers';
import type { EmisionResult } from '@app-types/emision.types';
import { PagoTargets } from '@screenplay/targets/facturacion/PagoTargets';

type TipoDocPago = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA';

export const PagarCotizacion = (tipoDoc: TipoDocPago) => {
    const fn = async (page: Page): Promise<EmisionResult> => {
        
        const emisionPromise = page.waitForResponse(
            (resp) =>
                resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            { timeout: 45_000 }
        );

        
        await CotizacionTargets.btnPagarCotizacion(page).click();
        await esperarCargaOverlay(page).catch(() => {});

        
        await CotizacionTargets.selectorTipoDocPago(page).click();
        await CotizacionTargets.opcionTipoDocPago(page, tipoDoc).click();

        
        await CotizacionTargets.btnConfirmarPago(page).click();
        await esperarCargaOverlay(page).catch(() => {});

        
        await PagoTargets.btnMontoExacto(page).click();
        await PagoTargets.btnRealizarPago(page).click();

        const response = await emisionPromise;
        const body = await response.json();

        const nombrePdf: string = body.FilePdf?.Nombre ?? '';
        const serie = nombrePdf.split('-')[0] ?? '';
        const correlativo = String(body.CorrelativoDocumento ?? '');
        const comprobanteId = body.IdComprobante ?? 0;

        return { serie, correlativo, comprobanteId };
    };
    fn.displayName = `Pagar cotización generando: ${tipoDoc}`;
    return fn;
};
