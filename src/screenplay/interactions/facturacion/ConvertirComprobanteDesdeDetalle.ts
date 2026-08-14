import {type Locator, type Page, type Response} from '@playwright/test';
import {esperarCargaOverlay} from '@utils/wait-helpers';
import type {EmisionResult} from '@app-types/emision.types';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {FiltrarComprobantePorTipo} from '@task/PuntoVenta/FiltrarComprobantePorTipo.task';
import {PagoTargets} from '@screenplay/targets/facturacion/PagoTargets';
import {CAJAS} from '@helpers/PuntoVenta/emision-data.helper';

export type TipoOrigen = 'COTIZACION' | 'PEDIDO';
export type TipoDocPago = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA';
export type ModoConversion = 'emitir-ahora' | 'editar-antes';

/** Parsea la response `DocumentosContables/Emisiones[/v2]` a EmisionResult. */
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

/**
 * Camino C de conversión: desde el popup de Ver Comprobante de una Cotización o
 * Pedido, selecciona "Convertir a" → tipo destino (Boleta/Factura/Nota de venta)
 * y ejecuta la emisión. Devuelve el EmisionResult del comprobante generado.
 *
 * DOM discovery 14-Ago-2026 (CRT-1) — flujo REAL del producto:
 * 1. "Convertir a" → tipo destino (ambos SIEMPRE visibles en el popup).
 * 2. Modal "Selecciona el modo de edición" (`.v-modal-header.orange`) con dos
 *    botones: "Emitir ahora" (danger) y "Editar antes de emitir" (info).
 * 3a. "Emitir ahora" → modal "Selecciona una caja de ventas" (`.cmp-card-caja` +
 *     Continuar `pv_shared_v-modal:cmp-grid-cajas_v-button:continuar`) → modal
 *     "Revisa tus datos antes de pagar" (Emitir
 *     `pv_cmp-ver-comprobante_v-modal:emision-cotizacion-pedido_v-button:emitir`)
 *     → modal `.cmp-realizar-pago` (Monto exacto / Realizar Pago) → response
 *     `POST DocumentosContables/Emisiones/v2`. Todo en la MISMA popup, SIN
 *     modal "¡Buen trabajo!".
 * 3b. "Editar antes de emitir" → VENTANA NUEVA `/punto-venta/cajas?goto=...`
 *     (lista de cajas, botón "Continuar vendiendo"
 *     `pv_cajas_{slug}_cmp-descripcion_v-button:abrir-modal-apertura-caja`) →
 *     navega a la caja Boleta/Factura/NV con el documento cargado → PAGAR →
 *     `.cmp-realizar-pago` → SÍ aparece "¡Buen trabajo!".
 *
 * @param modo por defecto `'emitir-ahora'`; `'editar-antes'` cubre el segundo
 * camino (requerido por el design: al menos 1 test por modo).
 */
export const ConvertirComprobanteDesdeDetalle = (
    numeroComprobante: string,
    tipoOrigen: TipoOrigen,
    tipoDestino: TipoDocPago,
    modo: ModoConversion = 'emitir-ahora',
) => {
    const fn = async (page: Page): Promise<EmisionResult> => {
        const busquedaPage = new BusquedaComprobantesPage(page);
        const verComprobante = busquedaPage.verComprobante;

        // 1) Búsqueda de Comprobantes → categoría origen (COTIZACIONES | PEDIDOS)
        await busquedaPage.ir();
        await FiltrarComprobantePorTipo(tipoOrigen === 'COTIZACION' ? 'COTIZACIONES' : 'PEDIDOS')(page);

        // 2) Filtrar por correlativo del comprobante origen
        await busquedaPage.filtrarPorCorrelativo(numeroComprobante);

        // 3) Abrir el popup de Ver Comprobante (fila filtrada)
        const verPopup = await busquedaPage.abrirVerComprobante();
        await esperarCargaOverlay(verPopup);

        // 4) En el popup: "Convertir a" → elegir tipo destino
        await verComprobante.abrirConvertirA(verPopup);
        await verComprobante.seleccionarTipoConvertir(verPopup, tipoDestino);
        await esperarCargaOverlay(verPopup).catch(() => {
        });

        // 5) Modal "Selecciona el modo de edición" → resolver el camino elegido.
        if (modo === 'emitir-ahora') {
            // 5a) "Emitir ahora": todo continúa en la MISMA popup.
            await verComprobante.seleccionarModoEdicion(verPopup, 'emitir-ahora');

            // Modal "Selecciona una caja de ventas": caja VENTA → Continuar.
            await verComprobante.seleccionarCajaEnModalCajas(verPopup, CAJAS.VENTA.nombre);
            await verComprobante.continuarModalCajas(verPopup);

            // Modal "Revisa tus datos antes de pagar" → Emitir.
            const emisionPromise = verPopup.waitForResponse(
                (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
                {timeout: 100_000},
            );
            await verComprobante.emitirDesdeRevisarDatos(verPopup);

            // Modal `.cmp-realizar-pago` → Monto exacto → Realizar Pago.
            const resultado = await pagarEnPopup(verPopup, emisionPromise);

            await verPopup.close().catch(() => {
            });
            return resultado;
        }

        // 5b) "Editar antes de emitir": ventana nueva con la lista de cajas.
        const popupCajasPromise = verPopup.waitForEvent('popup');
        await verComprobante.seleccionarModoEdicion(verPopup, 'editar-antes');
        const popupCajas = await popupCajasPromise;
        await esperarCargaOverlay(popupCajas).catch(() => {
        });

        // En la lista de cajas: "Continuar vendiendo" en la caja VENTA. La lista
        // navega a `/punto-venta/boleta/{caja}` (o factura/nota) con el documento
        // del comprobante origen ya cargado.
        await verComprobante.continuarVendiendoCajaEnLista(popupCajas, CAJAS.VENTA.nombre);

        // 6) Pago en la caja (patrón WU6: PAGAR + modales confirmar/monto + retry)
        //    — el modal "¡Buen trabajo!" SÍ aparece en este camino.
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

/**
 * Flujo de pago en la caja (modo "Editar antes de emitir"): espera la carga
 * ASÍNCRONA del documento (GET DocumentosContables/{id}, patrón WU6), clickea
 * PAGAR y maneja ambos modales (`.cmp-confirmar-pago` y `.cmp-realizar-pago`)
 * con reintento de respaldo. El modal "¡Buen trabajo!" confirma la emisión.
 */
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
            await esperarCargaOverlay(caja).catch(() => {
            });
            await montoExacto.waitFor({state: 'visible', timeout: 15_000});
            return;
        }

        if (abrió === 'ninguno') {
            throw new Error('El modal de pago no abrió tras clickear PAGAR');
        }
    };

    // Espera a que la caja cargue el documento (elimina la raza del click en PAGAR).
    await esperarDocCargado();

    // Primer intento de apertura del modal de pago.
    await caja.getByRole('button', {name: 'PAGAR'}).click();
    await esperarCargaOverlay(caja).catch(() => {
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
            await esperarCargaOverlay(caja).catch(() => {
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
