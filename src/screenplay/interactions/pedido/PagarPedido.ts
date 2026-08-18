import {type Page} from '@playwright/test';
import {PedidoTargets} from '@screenplay/targets/pedido/PedidoTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';
import type {EmisionResult} from '@app-types/emision.types';
import {PagoTargets} from '@screenplay/targets/facturacion/PagoTargets';

type TipoDocPago = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA';

/**
 * Paga un pedido CARGADO en la caja (Vista Facturación), convirtiéndolo en el
 * tipo de documento indicado (Boleta/Factura/Nota de Venta).
 *
 * Espejo de PagarCotizacion (Camino B cotización): usa el modal compartido
 * `.cmp-confirmar-pago` (targets centralizados en PagoTargets) y devuelve el
 * EmisionResult a partir de la response DocumentosContables/Emisiones.
 *
 * Requiere que el pedido ya esté cargado en la caja (p.ej. vía CargarPedidoDesdeLista).
 */
export const PagarPedido = (tipoDoc: TipoDocPago) => {
    const fn = async (page: Page): Promise<EmisionResult> => {

        const emisionPromise = page.waitForResponse(
            (resp) =>
                resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            {timeout: 45_000}
        );

        await PedidoTargets.btnPagarPedido(page).click();
        await esperarCargaOverlay(page).catch(() => {});

        await PagoTargets.selectorTipoDocPago(page).click();
        await PagoTargets.opcionTipoDocPago(page, tipoDoc).click();

        await PagoTargets.btnConfirmarPago(page).click();
        await esperarCargaOverlay(page).catch(() => {});

        await PagoTargets.btnMontoExacto(page).click();
        await PagoTargets.btnRealizarPago(page).click();

        const response = await emisionPromise;
        const body = await response.json();

        const nombrePdf: string = body.FilePdf?.Nombre ?? '';
        const serie = nombrePdf.split('-')[0] ?? '';
        const correlativo = String(body.CorrelativoDocumento ?? '');
        const comprobanteId = body.IdComprobante ?? 0;

        return {serie, correlativo, comprobanteId};
    };
    fn.displayName = `Pagar pedido generando: ${tipoDoc}`;
    return fn;
};
