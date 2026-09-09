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

        
        
        await esperarDocCargado();

        
        await popup.getByRole('button', {name: 'PAGAR'}).click();
        await esperarCargaOverlay(popup).catch(() => {
        });
        try {
            await confirmarYEsperarMonto(20_000);
        } catch {
            
            
            
            const [confirmarTardío, montoTardío] = await Promise.all([
                modalConfirmar.waitFor({state: 'visible', timeout: 8_000}).then(() => true).catch(() => false),
                montoExacto.waitFor({state: 'visible', timeout: 8_000}).then(() => true).catch(() => false),
            ]);
            if (!confirmarTardío && !montoTardío) {
                
                
                
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
