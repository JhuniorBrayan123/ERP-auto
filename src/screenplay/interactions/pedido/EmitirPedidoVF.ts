import {type Page} from '@playwright/test';
import {PedidoTargets} from '@screenplay/targets/pedido/PedidoTargets';
import {type ResultadoEmisionVF} from '@screenplay/interactions/cotizacion/EmitirCotizacionVF';

export const EmitirPedidoVF = () => {
    const fn = async (page: Page): Promise<ResultadoEmisionVF> => {
        const emisionPromise = page.waitForResponse(
            (resp) =>
                resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            {timeout: 45_000}
        );

        await PedidoTargets.btnGuardarPedidoFactura(page).click();

        const response = await emisionPromise;
        const body = await response.json();

        const nombrePdf: string = body.FilePdf?.Nombre ?? '';
        const serie = nombrePdf.split('-')[0] ?? '';
        const correlativo = String(body.CorrelativoDocumento ?? '');
        const comprobanteId = body.IdComprobante ?? 0;
        const numero = `${serie}-${correlativo.padStart(8, '0')}`;

        return {serie, correlativo, comprobanteId, numero};
    };
    fn.displayName = 'Emitir pedido desde Vista Facturación';
    return fn;
};
