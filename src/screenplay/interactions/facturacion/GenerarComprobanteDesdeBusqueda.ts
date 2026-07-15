import {type Page} from '@playwright/test';
import {esperarCargaOverlay} from '@utils/wait-helpers';
import type {EmisionResult} from '@app-types/emision.types';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {PagoTargets} from '@screenplay/targets/facturacion/PagoTargets';

type TipoDocPago = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA';

export const GenerarComprobanteDesdeBusqueda = (numeroComprobante: string, tipoDestino: TipoDocPago) => {
    const fn = async (page: Page): Promise<EmisionResult> => {
        const busquedaPage = new BusquedaComprobantesPage(page);
        await busquedaPage.filtrarPorCorrelativo(numeroComprobante);
        await esperarCargaOverlay(page).catch(() => {
        });

        await busquedaPage.abrirAccionesDeComprobante(numeroComprobante);
        await busquedaPage.seleccionarAccion('Generar comprobante');

        await busquedaPage.seleccionarAccion(tipoDestino === 'NOTA DE VENTA' ? 'Nota de venta' : tipoDestino.charAt(0).toUpperCase() + tipoDestino.slice(1).toLowerCase());

        const cardCaja = page.locator('.cmp-card-caja').filter({hasText: 'Caja de venta'}).first();
        if (await cardCaja.isVisible({timeout: 2000}).catch(() => false)) {
            await cardCaja.click();
        }

        const popupPromise = page.waitForEvent('popup');
        await page.locator('[id="pv_shared_v-modal:cmp-grid-cajas_v-button:continuar"]').click();
        const popup = await popupPromise;

        const emisionPromise = popup.waitForResponse(
            (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            {timeout: 45_000}
        );
        await popup.getByRole('button', {name: 'PAGAR'}).click();
        await PagoTargets.btnMontoExacto(popup).click();
        await PagoTargets.btnRealizarPago(popup).click();

        const response = await emisionPromise;
        const body = await response.json();

        await popup.getByText('¡Buen trabajo!').waitFor({state: 'visible', timeout: 10_000});

        const nombrePdf: string = body.FilePdf?.Nombre ?? '';
        const serie = nombrePdf.split('-')[0] ?? '';
        const correlativo = String(body.CorrelativoDocumento ?? '');
        const comprobanteId = body.IdComprobante ?? 0;
        await popup.close();

        return {serie, correlativo, comprobanteId};
    };

    fn.displayName = `Generar ${tipoDestino} desde búsqueda para: ${numeroComprobante}`;
    return fn;
};
