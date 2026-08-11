import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {recargarSiHayError} from "@utils/wait-helpers";

test.describe('PV-01 | Emisión de nota de venta con control de stock', {tag: ['@punto-venta', '@nota-venta', '@stock']}, () => {

    test('SC-01: Emitir nota de venta con producto con control de stock @PV-01.1', async ({
                                                                                        cajaPage,
                                                                                        comprobantePage,
                                                                                        emisionPage,
                                                                                        kardexApi,
                                                                                        busquedaComprobantes,
                                                                                        page
                                                                                    }) => {
        let saldoAntes = 0;

        await test.step('Given: caja abierta y tipo NOTA DE VENTA', async () => {
            await cajaPage.continuarVendiendo()
            await comprobantePage.seleccionarNotaVenta();
        });

        await test.step('And: capturar stock actual', async () => {
            saldoAntes = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_PV.ESTRICTO_GRAVADO_3.codigo,
                almacenFiltro: 'AUTO',
            });
        });

        await test.step('When: agregar producto y emitir', async () => {
            await emisionPage.buscarItem(ITEMS_PV.ESTRICTO_GRAVADO_3.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ESTRICTO_GRAVADO_3.nombre);
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: nota de venta emitida', async () => {
            await emisionPage.clickNuevaVenta();
        });
        await test.step('recargar si hay error', async () => {
            await recargarSiHayError(page)
        })
        await test.step('And: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        await test.step('And: abrir bitácora y verificar emisión y descargo', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitidonota();
            await busquedaComprobantes.validarDescargoInventarios();
            await busquedaComprobantes.cerrarBitacora();
        });

        await test.step('And: stock disminuyó en 1', async () => {
            const saldoDespues = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_PV.ESTRICTO_GRAVADO_3.codigo,
                almacenFiltro: 'AUTO',
            });
            expect(saldoDespues).toBe(saldoAntes - 1);
        });
    });
});
