import { type Page } from '@playwright/test';
import { esperarCargaOverlay } from '@utils/wait-helpers';
import type { EmisionResult } from '@app-types/emision.types';
import { CotizacionTargets } from '@screenplay/targets/cotizacion/CotizacionTargets';
import { BusquedaComprobantesPage } from '@pages/PuntoVenta/BusquedaComprobantesPage';
import { PagoTargets } from '@screenplay/targets/facturacion/PagoTargets';

type TipoDocPago = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA';

export const GenerarComprobanteDesdeBusqueda = (numeroComprobante: string, tipoDestino: TipoDocPago) => {
    const fn = async (page: Page): Promise<EmisionResult> => {
        const busquedaPage = new BusquedaComprobantesPage(page);

        // 1. Buscar el comprobante en la lista
        await busquedaPage.filtrarPorCorrelativo(numeroComprobante);
        await esperarCargaOverlay(page).catch(() => {});

        // 2. Abrir menú de acciones y click en Generar comprobante
        await busquedaPage.abrirAccionesDeComprobante(numeroComprobante);
        await busquedaPage.seleccionarAccion('Generar comprobante');

        // 3. Seleccionar tipo de documento (Factura, Boleta, etc.)
        // Nota: En la búsqueda, el codegen muestra que se selecciona directamente el texto en el dropdown
        await busquedaPage.seleccionarAccion(tipoDestino === 'NOTA DE VENTA' ? 'Nota de venta' : tipoDestino.charAt(0).toUpperCase() + tipoDestino.slice(1).toLowerCase());

        // 4. Seleccionar la caja (card) y hacer click en Continuar
        const cardCaja = page.locator('.cmp-card-caja').filter({ hasText: 'Caja de venta' }).first();
        if (await cardCaja.isVisible({ timeout: 2000 }).catch(() => false)) {
            await cardCaja.click();
        }

        // 5. Confirmar generación (Continuar) y capturar el POPUP
        const popupPromise = page.waitForEvent('popup');
        await page.locator('[id="pv_shared_v-modal:cmp-grid-cajas_v-button:continuar"]').click();
        const popup = await popupPromise;

        // 6. Interceptar la emisión final en el POPUP
        const emisionPromise = popup.waitForResponse(
            (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            { timeout: 45_000 }
        );

        // 7. En el popup: Click PAGAR -> Monto exacto -> Realizar Pago
        await popup.getByRole('button', { name: 'PAGAR' }).click();
        await PagoTargets.btnMontoExacto(popup).click();
        await PagoTargets.btnRealizarPago(popup).click();

        const response = await emisionPromise;
        const body = await response.json();

        const nombrePdf: string = body.FilePdf?.Nombre ?? '';
        const serie = nombrePdf.split('-')[0] ?? '';
        const correlativo = String(body.CorrelativoDocumento ?? '');
        const comprobanteId = body.IdComprobante ?? 0;

        // Cerrar el popup después de completar la emisión
        await popup.close();

        return { serie, correlativo, comprobanteId };
    };

    fn.displayName = `Generar ${tipoDestino} desde búsqueda para: ${numeroComprobante}`;
    return fn;
};
