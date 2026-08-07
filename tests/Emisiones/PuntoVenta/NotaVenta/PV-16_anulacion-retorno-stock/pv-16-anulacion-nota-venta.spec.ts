import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {BC_MOTIVOS_ELIMINACION} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {capturarStockNC, validarStockDespuesNC} from '@helpers/PuntoVenta/verificar-stock-nc.helper';
import {
    capturarMontoCaja,
    validarMontoCajaDespuesVenta,
    validarRetornoDineroCaja,
} from '@helpers/PuntoVenta/verificar-monto-caja.helper';
import {esperarStockDespuesVenta} from '@helpers/PuntoVenta/esperarStockDespuesVenta';
import {EliminarComprobante} from '@task/PuntoVenta/busqueda-comprobantes/EliminarComprobante';
import {recargarSiHayError} from '@utils/wait-helpers';
import type {ComprobanteApi} from '@services/PuntoVenta/ComprobanteApi';

/**
 * Obtiene el monto total REAL de la Nota de Venta emitida consultando a la API
 * de comprobantes, filtrando por serie + correlativo de la última emisión.
 * Si el correlativo se repite entre series, se refina por la serie.
 */
async function obtenerMontoTotalNV(
    comprobanteApi: ComprobanteApi,
    emision: {serie: string; correlativo: string},
): Promise<number> {
    const comprobantes = await comprobanteApi.consultarComprobantes({tamanio: 100});
    const correlativoNum = Number(emision.correlativo);
    const serieNorm = emision.serie.trim().toLowerCase();

    const coincidencia =
        comprobantes.find(c =>
            c.correlativoDocumento === correlativoNum &&
            c.serieDescripcion?.trim().toLowerCase() === serieNorm,
        ) ??
        comprobantes.find(c => c.correlativoDocumento === correlativoNum);

    if (!coincidencia) {
        throw new Error(
            `No se encontró la Nota de Venta ${emision.serie}-${emision.correlativo} en la consulta de comprobantes`,
        );
    }
    return coincidencia.montoTotal;
}

test.describe('PV-16 | Anulación de Nota de Venta con retorno de stock', {
    tag: ['@punto-venta', '@nota-venta', '@stock', '@anulacion'],
}, () => {

    test('SC-01: Anular NV emitida desde Búsqueda y verificar retorno de stock, retorno de dinero y estado ANULADO @PV-16.2', async ({
                                                                                                                               cajaPage,
                                                                                                                               comprobantePage,
                                                                                                                               emisionPage,
                                                                                                                               kardexApi,
                                                                                                                               cajasApi,
                                                                                                                               comprobanteApi,
                                                                                                                               busquedaComprobantes,
                                                                                                                               page
                                                                                                                           }) => {
        const item = ITEMS_PV.ESTRICTO_GRAVADO_2;
        let stockOriginal = 0;
        let montoInicial = 0;

        await test.step('Given caja abierta y tipo NOTA DE VENTA seleccionado', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarNotaVenta();
        });

        await test.step('And se captura el stock original del ítem', async () => {
            stockOriginal = await capturarStockNC(kardexApi, item.codigo);
        });

        await test.step('And se captura el monto actual en SOLES de la caja', async () => {
            montoInicial = await capturarMontoCaja(cajasApi);
        });

        await test.step('When se agrega el ítem y se emite la nota de venta con efectivo exacto', async () => {
            await emisionPage.buscarItem(item.codigo);
            await emisionPage.seleccionarItem(item.nombre);
            await emisionPage.emitirConEfectivoExacto();
        });

        const emision = emisionPage.ultimaEmision;
        expect(emision?.correlativo).toBeTruthy();

        await test.step('And el stock baja tras la venta', async () => {
            await esperarStockDespuesVenta({
                kardexApi,
                codigoProducto: item.codigo,
                stockOriginal,
                cantidadVendida: item.cantidad,
            });
        });

        const stockDespuesVenta = stockOriginal - item.cantidad;

        await test.step('And el monto en SOLES de la caja sube en ~el monto total de la venta', async () => {
            const montoTotalNV = await obtenerMontoTotalNV(comprobanteApi, emision!);
            expect(montoTotalNV).toBeGreaterThan(0);

            await validarMontoCajaDespuesVenta({
                cajasApi,
                montoInicial,
                montoTotalVenta: montoTotalNV,
            });
        });

        await test.step('And se cierra el modal de éxito y se navega a Búsqueda de comprobantes filtrando por el correlativo emitido', async () => {
            await emisionPage.clickNuevaVenta();
            await recargarSiHayError(page);
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        const numeroCompleto = `${emision!.serie}-${emision!.correlativo}`;

        await test.step('When se anula la nota de venta desde Búsqueda de comprobantes', async () => {
            await busquedaComprobantes.abrirAccionesDeComprobante(numeroCompleto);
            await EliminarComprobante.conMotivo(BC_MOTIVOS_ELIMINACION.ERROR_DATOS)(page);
        });

        await test.step('Then el stock del ítem vuelve al valor original tras la anulación', async () => {
            await validarStockDespuesNC({
                kardexApi,
                codigoProducto: item.codigo,
                stockOriginal,
                stockDespuesVenta,
                cantidadDevuelta: item.cantidad,
                retornoStock: true,
            });
        });

        await test.step('Then el monto en SOLES de la caja retorna al valor inicial (delta neto ~0) tras la anulación', async () => {
            await validarRetornoDineroCaja({
                cajasApi,
                montoInicial,
                montoDespuesVenta: montoInicial, // solo informativo; el esperado es saldo inicial
                retornoDinero: true,
            });
        });

        await test.step('And el comprobante queda dado de baja (ELIMINADO), pago ANULADO y estado SUNAT vacío en la búsqueda', async () => {
            const celdasEstado = busquedaComprobantes.grid.obtenerCeldasDeEstado(numeroCompleto);

            // nth(0): Estado de comprobante
            await expect(celdasEstado.nth(0)).toHaveText('ELIMINADO');
            // nth(1): Estado de pago
            await expect(celdasEstado.nth(1)).toHaveText('ANULADO');

            // Estado SUNAT: para Notas de Venta la celda queda vacía (no se envía a SUNAT)
            const celdaSunat = await busquedaComprobantes.grid.obtenerCeldaSunat(numeroCompleto);
            await expect(celdaSunat).toHaveText(/^\s*$/);
        });
    });
});