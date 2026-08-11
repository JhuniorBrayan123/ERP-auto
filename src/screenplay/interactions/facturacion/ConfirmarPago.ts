import { type Page } from '@playwright/test';
import type { EmisionResult } from '@app-types/emision.types';
import { PagoTargets } from '@screenplay/targets/facturacion/PagoTargets';

type MetodoPago = 'efectivo' | 'cheque' | 'niubiz' | 'yape' | 'plin' | 'transferencia';

export const ConfirmarPago = (metodo: MetodoPago = 'efectivo') => {
    const fn = async (page: Page): Promise<EmisionResult> => {
        const emisionPromise = page.waitForResponse(
            (resp) =>
                resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            { timeout: 45_000 }
        );

        await PagoTargets.btnPagar(page).click();

        if (metodo === 'efectivo') {
            await PagoTargets.btnMontoExacto(page).click();
        } else {
            const nombres: Record<MetodoPago, string> = {
                efectivo: 'Monto exacto',
                cheque: 'CHEQUE',
                niubiz: 'NIUBIZ',
                yape: 'YAPE',
                plin: 'PLIN',
                transferencia: 'TRANSFERENCIA',
            };
            await PagoTargets.btnMetodoPago(page, nombres[metodo]).click();
        }

        await PagoTargets.btnRealizarPago(page).click();

        const response = await emisionPromise;
        const body = await response.json();

        const nombrePdf: string = body.FilePdf?.Nombre ?? '';
        const serie = nombrePdf.split('-')[0] ?? '';
        const correlativo = String(body.CorrelativoDocumento ?? '');
        const comprobanteId = body.IdComprobante ?? 0;

        return { serie, correlativo, comprobanteId };
    };
    fn.displayName = `Confirmar pago con método: ${metodo}`;
    return fn;
};
