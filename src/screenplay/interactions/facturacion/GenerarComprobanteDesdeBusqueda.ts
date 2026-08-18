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
            {timeout: 100_000}
        );

        // El popup (caja) carga el comprobante de forma ASÍNCRONA tras abrirse
        // (GET PuntoVenta/api/DocumentosContables/{id}, hasta ~5s+ en CRT-1). Si PAGAR
        // se clickea antes de que termine esa carga, el click se pierde y el modal de
        // pago no abre (o tarda). Además, la UI del 13-Ago-2026 puede mostrar el modal
        // intermedio `.cmp-confirmar-pago` (mismo que PagarPedido/PagarCotizacion)
        // ANTES de abrir `.cmp-realizar-pago`. Se espera el documento del popup antes
        // de clickear PAGAR y se manejan ambos modales con reintento de respaldo.
        let docCargado = false;
        popup.on('response', (resp) => {
            if (!docCargado && /DocumentosContables\/\d+$/.test(resp.url()) && resp.status() === 200) {
                docCargado = true;
            }
        });
        const esperarDocCargado = async (): Promise<boolean> => {
            const limite = Date.now() + 20_000;
            while (!docCargado && Date.now() < limite) {
                await new Promise((resolve) => setTimeout(resolve, 250));
            }
            return docCargado;
        };

        const modalConfirmar = PagoTargets.modalConfirmarPago(popup);
        const montoExacto = PagoTargets.btnMontoExacto(popup);

        // Espera el primer modal que abra (el intermedio de confirmación o el
        // directo de realizar pago).
        const primerModalEnAbrir = async (timeoutMs: number): Promise<'confirmar' | 'monto' | 'ninguno'> => {
            return Promise.race([
                modalConfirmar.waitFor({state: 'visible', timeout: timeoutMs}).then(() => 'confirmar' as const).catch(() => 'ninguno' as const),
                montoExacto.waitFor({state: 'visible', timeout: timeoutMs}).then(() => 'monto' as const).catch(() => 'ninguno' as const),
            ]);
        };

        const confirmarYEsperarMonto = async (timeoutMs: number): Promise<void> => {
            const abrió = await primerModalEnAbrir(timeoutMs);

            if (abrió === 'confirmar') {
                await PagoTargets.selectorTipoDocPago(popup).click();
                await PagoTargets.opcionTipoDocPago(popup, tipoDestino).click();
                await PagoTargets.btnConfirmarPago(popup).click();
                await esperarCargaOverlay(popup).catch(() => {
                });
                await montoExacto.waitFor({state: 'visible', timeout: 15_000});
                return;
            }

            if (abrió === 'ninguno') {
                throw new Error('El modal de pago no abrió tras clickear PAGAR');
            }
        };

        // Espera a que la caja termine de cargar el documento del comprobante para
        // que el click en PAGAR no se pierda (elimina la raza de carga del popup).
        await esperarDocCargado();

        // Primer intento de apertura del modal de pago.
        await popup.getByRole('button', {name: 'PAGAR'}).click();
        await esperarCargaOverlay(popup).catch(() => {
        });
        try {
            await confirmarYEsperarMonto(20_000);
        } catch {
            // Respaldo: si un modal apareció tarde (tras el primer intento), se
            // confirma sin volver a clickear PAGAR; si no, se reintenta el click con
            // el comprobante ya cargado (en ese momento el modal debe abrir).
            const [confirmarTardío, montoTardío] = await Promise.all([
                modalConfirmar.waitFor({state: 'visible', timeout: 8_000}).then(() => true).catch(() => false),
                montoExacto.waitFor({state: 'visible', timeout: 8_000}).then(() => true).catch(() => false),
            ]);
            if (!confirmarTardío && !montoTardío) {
                // Click de respaldo con action timeout corto: si un modal aparece en
                // ese instante cubriendo PAGAR, el click no debe bloquear 35s — se
                // aborta y se pasa a confirmar el modal que haya abierto.
                await popup.getByRole('button', {name: 'PAGAR'}).click({timeout: 5_000}).catch(() => {
                });
                await esperarCargaOverlay(popup).catch(() => {
                });
            }
            await confirmarYEsperarMonto(25_000);
        }

        await montoExacto.click();
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
