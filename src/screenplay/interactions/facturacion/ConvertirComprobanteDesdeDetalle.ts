import {type Locator, type Page, type Response} from '@playwright/test';
import {esperarCargaOverlay} from '@utils/wait-helpers';
import type {EmisionResult} from '@app-types/emision.types';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {FiltrarComprobantePorTipo} from '@task/PuntoVenta/FiltrarComprobantePorTipo.task';
import {PagoTargets} from '@screenplay/targets/facturacion/PagoTargets';

export type TipoOrigen = 'COTIZACION' | 'PEDIDO';
export type TipoDocPago = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA';

/**
 * Ejecuta el flujo de pago/conversión en el contexto indicado (la popup de Ver
 * Comprobante o la ventana nueva con la caja), reutilizando el patrón de WU6 de
 * GenerarComprobanteDesdeBusqueda:
 *  - esperar la carga ASÍNCRONA del documento de la caja (GET
 *    DocumentosContables/{id}) antes de clickear PAGAR (elimina la raza del click
 *    perdido);
 *  - manejar AMBOS modales de pago (`.cmp-confirmar-pago` y `.cmp-realizar-pago`)
 *    con reintento de respaldo si el modal aparece tarde o PAGAR queda cubierto;
 *  - parsear la response `DocumentosContables/Emisiones` a EmisionResult.
 */
async function pagarYParsearEmision(
    contexto: Page,
    tipoDestino: TipoDocPago,
    emisionPromise: Promise<Response>,
    esperarDocDeCaja: boolean,
): Promise<EmisionResult> {
    let docCargado = false;
    contexto.on('response', (resp) => {
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

    const modalConfirmar = PagoTargets.modalConfirmarPago(contexto);
    const montoExacto = PagoTargets.btnMontoExacto(contexto);

    const primerModalEnAbrir = async (timeoutMs: number): Promise<'confirmar' | 'monto' | 'ninguno'> => {
        return Promise.race([
            modalConfirmar.waitFor({state: 'visible', timeout: timeoutMs}).then(() => 'confirmar' as const).catch(() => 'ninguno' as const),
            montoExacto.waitFor({state: 'visible', timeout: timeoutMs}).then(() => 'monto' as const).catch(() => 'ninguno' as const),
        ]);
    };

    const confirmarYEsperarMonto = async (timeoutMs: number): Promise<void> => {
        const abrió = await primerModalEnAbrir(timeoutMs);

        if (abrió === 'confirmar') {
            await PagoTargets.selectorTipoDocPago(contexto).click();
            await PagoTargets.opcionTipoDocPago(contexto, tipoDestino).click();
            await PagoTargets.btnConfirmarPago(contexto).click();
            await esperarCargaOverlay(contexto).catch(() => {
            });
            await montoExacto.waitFor({state: 'visible', timeout: 15_000});
            return;
        }

        if (abrió === 'ninguno') {
            throw new Error('El modal de pago no abrió tras elegir el tipo de conversión');
        }
    };

    // La espera de carga asíncrona del documento SOLO aplica cuando el pago ocurre
    // en una ventana nueva de caja (la caja carga el comprobante con un GET
    // DocumentosContables/{id} tras abrirse). Si el pago continúa en la popup de
    // Ver Comprobante, el documento ya está cargado: no penalizar 20s por test.
    if (esperarDocDeCaja) {
        await esperarDocCargado();
    }

    // Primer intento de apertura del modal. PAGAR puede no existir si el modal ya
    // abrió en la popup de Ver Comprobante: timeout corto para no bloquear 35s.
    await contexto.getByRole('button', {name: 'PAGAR'}).click({timeout: 5_000}).catch(() => {
    });
    await esperarCargaOverlay(contexto).catch(() => {
    });
    try {
        await confirmarYEsperarMonto(20_000);
    } catch {
        // Respaldo: si un modal apareció tarde (tras el primer intento) se confirma
        // sin volver a clickear PAGAR; si no hay modal, se reintenta el click con el
        // documento ya cargado (en ese momento el modal debe abrir).
        const [confirmarTardío, montoTardío] = await Promise.all([
            modalConfirmar.waitFor({state: 'visible', timeout: 8_000}).then(() => true).catch(() => false),
            montoExacto.waitFor({state: 'visible', timeout: 8_000}).then(() => true).catch(() => false),
        ]);
        if (!confirmarTardío && !montoTardío) {
            await contexto.getByRole('button', {name: 'PAGAR'}).click({timeout: 5_000}).catch(() => {
            });
            await esperarCargaOverlay(contexto).catch(() => {
            });
        }
        await confirmarYEsperarMonto(25_000);
    }

    await montoExacto.click();
    await PagoTargets.btnRealizarPago(contexto).click();

    const response = await emisionPromise;
    const body = await response.json();

    await contexto.getByText('¡Buen trabajo!').waitFor({state: 'visible', timeout: 10_000});

    const nombrePdf: string = body.FilePdf?.Nombre ?? '';
    const serie = nombrePdf.split('-')[0] ?? '';
    const correlativo = String(body.CorrelativoDocumento ?? '');
    const comprobanteId = body.IdComprobante ?? 0;

    return {serie, correlativo, comprobanteId};
}

/**
 * Camino C de conversión: desde el popup de Ver Comprobante de una Cotización o
 * Pedido, selecciona "Convertir a" → tipo destino (Boleta/Factura/Nota de venta)
 * y ejecuta el flujo de pago en la caja VENTA. Devuelve el EmisionResult del
 * comprobante generado.
 *
 * Manejo dual (decisión D7 del design): la conversión puede continuar en la misma
 * popup de Ver Comprobante o abrir una ventana nueva con la caja — se detectan
 * ambos escenarios (selector de caja en popup, ventana nueva, o modal de pago
 * directo en la popup) antes de pagar.
 */
export const ConvertirComprobanteDesdeDetalle = (
    numeroComprobante: string,
    tipoOrigen: TipoOrigen,
    tipoDestino: TipoDocPago,
) => {
    const fn = async (page: Page): Promise<EmisionResult> => {
        const busquedaPage = new BusquedaComprobantesPage(page);

        // 1) Búsqueda de Comprobantes → categoría origen (COTIZACIONES | PEDIDOS)
        await busquedaPage.ir();
        await FiltrarComprobantePorTipo(tipoOrigen === 'COTIZACION' ? 'COTIZACIONES' : 'PEDIDOS')(page);

        // 2) Filtrar por correlativo del comprobante origen
        await busquedaPage.filtrarPorCorrelativo(numeroComprobante);

        // 3) Abrir el popup de Ver Comprobante (fila filtrada)
        const verPopup = await busquedaPage.abrirVerComprobante();
        await esperarCargaOverlay(verPopup);

        // 4) En el popup: "Convertir a" → elegir tipo destino
        await busquedaPage.verComprobante.abrirConvertirA(verPopup);
        await busquedaPage.verComprobante.seleccionarTipoConvertir(verPopup, tipoDestino);
        await esperarCargaOverlay(verPopup).catch(() => {
        });

        // 5) Resolver el contexto de pago (manejo dual popup/ventana).
        let contexto: Page = verPopup;

        // 5a) Posible selector de caja dentro de la popup (fallback del design):
        //     elegir VENTA y Continuar → puede abrir la caja en ventana nueva.
        const elegirCajaYContinuar = async (origen: Page, card: Locator): Promise<Page | null> => {
            await card.click();
            const popupCajaPromise = origen.waitForEvent('popup', {timeout: 30_000}).catch(() => null);
            await origen.getByRole('button', {name: 'Continuar'}).click();
            return Promise.race([
                popupCajaPromise,
                new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000)),
            ]);
        };

        const cardCajaVenta = verPopup.locator('.cmp-card-caja').filter({hasText: 'Caja de venta'}).first();
        const cualquierCaja = verPopup.locator('.cmp-card-caja').first();
        if (await cardCajaVenta.isVisible({timeout: 5_000}).catch(() => false)) {
            const ventanaCaja = await elegirCajaYContinuar(verPopup, cardCajaVenta);
            if (ventanaCaja) contexto = ventanaCaja;
        } else if (await cualquierCaja.isVisible({timeout: 2_000}).catch(() => false)) {
            const ventanaCaja = await elegirCajaYContinuar(verPopup, cualquierCaja);
            if (ventanaCaja) contexto = ventanaCaja;
        } else {
            // 5b) Sin selector de caja: la conversión abre la caja en ventana nueva o
            //     muestra el modal de pago directamente en la popup de Ver Comprobante.
            const popupAbierta = verPopup.waitForEvent('popup', {timeout: 30_000}).catch(() => null);
            const abrioModal = await Promise.race([
                PagoTargets.modalConfirmarPago(verPopup).waitFor({state: 'visible', timeout: 15_000}).then(() => true).catch(() => false),
                PagoTargets.btnMontoExacto(verPopup).waitFor({state: 'visible', timeout: 15_000}).then(() => true).catch(() => false),
            ]);
            const ventana = await Promise.race([
                popupAbierta,
                new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000)),
            ]);
            if (ventana) {
                contexto = ventana;
            } else if (!abrioModal) {
                // Caso límite: ni modal ni ventana → el helper de pago reintentará
                // (respaldo WU6) en la popup de Ver Comprobante.
                contexto = verPopup;
            }
        }
        await esperarCargaOverlay(contexto).catch(() => {
        });

        // 6) Emisión: esperar la response de Emisiones en el contexto de pago
        const emisionPromise = contexto.waitForResponse(
            (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            {timeout: 100_000}
        );

        // 7) Flujo de pago + parseo del resultado
        const resultado = await pagarYParsearEmision(
            contexto,
            tipoDestino,
            emisionPromise,
            contexto !== verPopup,
        );

        // Cerrar la popup de Ver Comprobante si sigue abierta
        await verPopup.close().catch(() => {
        });
        return resultado;
    };

    fn.displayName = `Convertir ${numeroComprobante} (${tipoOrigen}) a ${tipoDestino} desde detalle`;
    return fn;
};
