import {type Locator, type Page, type Response} from '@playwright/test';
import {esperarCargaOverlaySiVisible} from '@utils/wait-helpers';
import type {EmisionResult} from '@app-types/emision.types';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {FiltrarComprobantePorTipo} from '@task/PuntoVenta/FiltrarComprobantePorTipo.task';
import {PagoTargets} from '@screenplay/targets/facturacion/PagoTargets';
import {CAJAS} from '@helpers/PuntoVenta/emision-data.helper';

export type TipoOrigen = 'COTIZACION' | 'PEDIDO';
export type TipoDocPago = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA';
export type ModoConversion = 'emitir-ahora' | 'editar-antes';


async function parsearEmision(response: Response): Promise<EmisionResult> {
    const body = await response.json();
    const nombrePdf: string = body.FilePdf?.Nombre ?? '';
    return {
        serie: nombrePdf.split('-')[0] ?? '',
        correlativo: String(body.CorrelativoDocumento ?? ''),
        comprobanteId: body.IdComprobante ?? 0,
    };
}

/**
 * Flujo de pago en la popup de Ver Comprobante (modo "Emitir ahora"): tras el
 * click en "Emitir" del modal "Revisa tus datos antes de pagar" se abre
 * DIRECTAMENTE el modal `.cmp-realizar-pago` (DOM discovery 14-Ago-2026:
 * NO aparece `.cmp-confirmar-pago` en este camino y NO hay botón PAGAR).
 * Además, en la popup NO aparece el modal "¡Buen trabajo!" — la emisión se
 * valida por la response `DocumentosContables/Emisiones`.
 */
async function pagarEnPopup(verPopup: Page, emisionPromise: Promise<Response>): Promise<EmisionResult> {
    const montoExacto = PagoTargets.btnMontoExacto(verPopup);
    await montoExacto.waitFor({state: 'visible', timeout: 25_000});
    await montoExacto.click();
    await PagoTargets.btnRealizarPago(verPopup).click();

    const response = await emisionPromise;
    return parsearEmision(response);
}


export const ConvertirComprobanteDesdeDetalle = (
    numeroComprobante: string,
    tipoOrigen: TipoOrigen,
    tipoDestino: TipoDocPago,
    modo: ModoConversion = 'emitir-ahora',
) => {
    const fn = async (page: Page): Promise<EmisionResult> => {
        const busquedaPage = new BusquedaComprobantesPage(page);
        const verComprobante = busquedaPage.verComprobante;

        
        await busquedaPage.ir();
        await FiltrarComprobantePorTipo(tipoOrigen === 'COTIZACION' ? 'COTIZACIONES' : 'PEDIDOS')(page);

        
        await busquedaPage.filtrarPorCorrelativo(numeroComprobante);

        
        const verPopup = await busquedaPage.abrirVerComprobante();
        await esperarCargaOverlaySiVisible(verPopup);

        
        await verComprobante.abrirConvertirA(verPopup);
        await verComprobante.seleccionarTipoConvertir(verPopup, tipoDestino);
        await esperarCargaOverlaySiVisible(verPopup).catch(() => {
        });

        
        if (modo === 'emitir-ahora') {
            
            await verComprobante.seleccionarModoEdicion(verPopup, 'emitir-ahora');

            
            await verComprobante.seleccionarCajaEnModalCajas(verPopup, CAJAS.VENTA.nombre);
            await verComprobante.continuarModalCajas(verPopup);

            
            const emisionPromise = verPopup.waitForResponse(
                (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
                {timeout: 100_000},
            );
            await verComprobante.emitirDesdeRevisarDatos(verPopup);

            
            const resultado = await pagarEnPopup(verPopup, emisionPromise);

            await verPopup.close().catch(() => {
            });
            return resultado;
        }

        
        const popupCajasPromise = verPopup.waitForEvent('popup');
        await verComprobante.seleccionarModoEdicion(verPopup, 'editar-antes');
        const popupCajas = await popupCajasPromise;
        await esperarCargaOverlaySiVisible(popupCajas).catch(() => {
        });

        
        
        
        await verComprobante.continuarVendiendoCajaEnLista(popupCajas, CAJAS.VENTA.nombre);

        
        
        const resultado = await pagarEnCaja(popupCajas, tipoDestino);

        await popupCajas.close().catch(() => {
        });
        await verPopup.close().catch(() => {
        });
        return resultado;
    };

    fn.displayName = `Convertir ${numeroComprobante} (${tipoOrigen}) a ${tipoDestino} desde detalle [${modo}]`;
    return fn;
};


async function pagarEnCaja(caja: Page, tipoDestino: TipoDocPago): Promise<EmisionResult> {
    let docCargado = false;
    caja.on('response', (resp) => {
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

    const emisionPromise = caja.waitForResponse(
        (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
        {timeout: 100_000},
    );

    const modalConfirmar = PagoTargets.modalConfirmarPago(caja);
    const montoExacto = PagoTargets.btnMontoExacto(caja);

    const primerModalEnAbrir = async (timeoutMs: number): Promise<'confirmar' | 'monto' | 'ninguno'> => {
        return Promise.race([
            modalConfirmar.waitFor({state: 'visible', timeout: timeoutMs}).then(() => 'confirmar' as const).catch(() => 'ninguno' as const),
            montoExacto.waitFor({state: 'visible', timeout: timeoutMs}).then(() => 'monto' as const).catch(() => 'ninguno' as const),
        ]);
    };

    const confirmarYEsperarMonto = async (timeoutMs: number): Promise<void> => {
        const abrió = await primerModalEnAbrir(timeoutMs);

        if (abrió === 'confirmar') {
            await PagoTargets.selectorTipoDocPago(caja).click();
            await PagoTargets.opcionTipoDocPago(caja, tipoDestino).click();
            await PagoTargets.btnConfirmarPago(caja).click();
            await esperarCargaOverlaySiVisible(caja).catch(() => {
            });
            await montoExacto.waitFor({state: 'visible', timeout: 15_000});
            return;
        }

        if (abrió === 'ninguno') {
            throw new Error('El modal de pago no abrió tras clickear PAGAR');
        }
    };

    
    await esperarDocCargado();

    
    await caja.getByRole('button', {name: 'PAGAR'}).click();
    await esperarCargaOverlaySiVisible(caja).catch(() => {
    });
    try {
        await confirmarYEsperarMonto(20_000);
    } catch {
        const [confirmarTardío, montoTardío] = await Promise.all([
            modalConfirmar.waitFor({state: 'visible', timeout: 8_000}).then(() => true).catch(() => false),
            montoExacto.waitFor({state: 'visible', timeout: 8_000}).then(() => true).catch(() => false),
        ]);
        if (!confirmarTardío && !montoTardío) {
            await caja.getByRole('button', {name: 'PAGAR'}).click({timeout: 5_000}).catch(() => {
            });
            await esperarCargaOverlaySiVisible(caja).catch(() => {
            });
        }
        await confirmarYEsperarMonto(25_000);
    }

    await montoExacto.click();
    await PagoTargets.btnRealizarPago(caja).click();

    const response = await emisionPromise;
    const resultado = await parsearEmision(response);

    await caja.getByText('¡Buen trabajo!').waitFor({state: 'visible', timeout: 10_000});

    return resultado;
}
