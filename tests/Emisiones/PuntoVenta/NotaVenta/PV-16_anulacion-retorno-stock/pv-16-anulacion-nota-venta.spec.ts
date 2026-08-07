import {test} from '@fixtures/PuntoVenta/anulacion-nota-venta.fixture';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {BC_MOTIVOS_ELIMINACION} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {EmitirNotaVentaConRetorno} from '@screenplay/tasks/nota-venta/EmitirNotaVentaConRetorno';
import {AnularNotaVentaDesdeBusqueda} from '@screenplay/tasks/nota-venta/AnularNotaVentaDesdeBusqueda';
import {VerificarRetornoStock} from '@screenplay/tasks/nota-venta/VerificarRetornoStock';
import {VerificarRetornoDineroCaja} from '@screenplay/tasks/nota-venta/VerificarRetornoDineroCaja';
import {VerificarComprobanteAnulado} from '@screenplay/tasks/nota-venta/VerificarComprobanteAnulado';

test.describe('PV-16 | Anulación de Nota de Venta con retorno de stock', {
    tag: ['@punto-venta', '@nota-venta', '@stock', '@anulacion'],
}, () => {

    test('SC-01: Anular NV emitida desde Búsqueda y verificar retorno de stock, retorno de dinero y estado ANULADO @PV-16.2', async ({
        cajero,
        kardexApi,
        cajasApi,
    }) => {
        const item = ITEMS_PV.ESTRICTO_GRAVADO_2;

        const venta = await cajero.realizaYObtiene(
            EmitirNotaVentaConRetorno({item, kardexApi, cajasApi})
        );

        await cajero.realiza(
            AnularNotaVentaDesdeBusqueda({
                correlativo: venta.correlativo,
                numeroCompleto: venta.numeroCompleto,
                motivo: BC_MOTIVOS_ELIMINACION.ERROR_DATOS,
            })
        );

        await cajero.realiza(
            VerificarRetornoStock({
                item,
                kardexApi,
                stockOriginal: venta.stockOriginal,
                stockDespuesVenta: venta.stockDespuesVenta,
            }),
            VerificarRetornoDineroCaja({
                cajasApi,
                montoInicial: venta.montoInicial,
                nombreCaja: venta.nombreCaja,
            }),
            VerificarComprobanteAnulado({numeroCompleto: venta.numeroCompleto}),
        );
    });
});