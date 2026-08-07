import {test} from '@playwright/test';
import type {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import type {ClientePage} from '@pages/PuntoVenta/ClientePage';
import type {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import type {ComprobanteDetallePage} from '@pages/PuntoVenta/ComprobanteDetallePage';
import type {DatosCliente, EmisionResult, ItemVenta, TipoComprobante} from '@app-types/emision.types';
import {SERIES} from '@helpers/PuntoVenta/emision-data.helper';

export interface EmisionBasicaParams {
    tipoComprobante: TipoComprobante;
    cliente?: DatosCliente & { textoSelector?: string };
    items: ItemVenta[];
}

export interface EmisionBasicaPages {
    comprobantePage: ComprobantePage;
    clientePage: ClientePage;
    emisionPage: EmisionPage;
    comprobanteDetalle: ComprobanteDetallePage;
}

export async function ejecutarEmisionBasica(
    pages: EmisionBasicaPages,
    params: EmisionBasicaParams,
): Promise<EmisionResult> {
    const {comprobantePage, clientePage, emisionPage, comprobanteDetalle} = pages;

    await test.step(`Given: seleccionar tipo de comprobante "${params.tipoComprobante}"`, async () => {
        await comprobantePage.seleccionarTipoComprobante(params.tipoComprobante);
    });

    if (params.cliente) {
        await test.step(`And: seleccionar cliente "${params.cliente.nombre}"`, async () => {
            await clientePage.buscarCliente(params.cliente!.documento);
            const textoClick = params.cliente!.textoSelector ?? params.cliente!.nombre;
            await clientePage.seleccionarClientePorTexto(textoClick);
        });
    }

    for (const item of params.items) {
        await test.step(`And: agregar ítem "${item.nombre}" x${item.cantidad}`, async () => {
            await emisionPage.buscarItem(item.codigo);
            await emisionPage.seleccionarItem(item.nombre);
            if (item.cantidad > 1) {
                await emisionPage.incrementarCantidad(item.cantidad - 1);
            }
        });
    }

    let resultado: EmisionResult = {serie: '', correlativo: '', comprobanteId: 0, montoTotalVenta: 0};

    await test.step('When: emitir comprobante con efectivo', async () => {
        await emisionPage.emitirConEfectivoExacto();

        const seriePrefix = params.tipoComprobante === 'BOLETA' ? SERIES.BOLETA
            : params.tipoComprobante === 'FACTURA' ? SERIES.FACTURA
                : SERIES.NOTA_VENTA;

        resultado = await comprobanteDetalle.capturarSerieCorrelativo(seriePrefix)
            .catch(() => ({serie: seriePrefix, correlativo: '', comprobanteId: 0, montoTotalVenta: 0}));
    });

    return resultado;
}
