import {test} from '@fixtures/PuntoVenta/anulacion-nota-venta.fixture';
import {ITEMS_PV, PRODUCTO_MANUAL} from '@helpers/PuntoVenta/emision-data.helper';
import {BC_MOTIVOS_ELIMINACION} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {EmitirNotaVentaConRetorno} from '@screenplay/tasks/nota-venta/EmitirNotaVentaConRetorno';
import {AnularNotaVentaDesdeBusqueda} from '@screenplay/tasks/nota-venta/AnularNotaVentaDesdeBusqueda';
import {VerificarRetornoStock} from '@screenplay/tasks/nota-venta/VerificarRetornoStock';
import {VerificarRetornoDineroCaja} from '@screenplay/tasks/nota-venta/VerificarRetornoDineroCaja';
import {VerificarComprobanteAnulado} from '@screenplay/tasks/nota-venta/VerificarComprobanteAnulado';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import {capturarStockNC} from '@helpers/PuntoVenta/verificar-stock-nc.helper';
import {esperarStockDespuesVenta} from '@helpers/PuntoVenta/esperarStockDespuesVenta';
import {capturarMontoCaja, validarMontoCajaDespuesVenta} from '@helpers/PuntoVenta/verificar-monto-caja.helper';
import {recargarSiHayError} from '@utils/wait-helpers';
import {AgregarProductoManual} from '@screenplay/interactions/facturacion/AgregarProductoManual';
import {UsarNavegador} from '@abilities/usarnavegador';

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

    test('SC-02: Anular NV con item manual + estricto combinados — verificar retorno de stock solo en el estricto @PV-16.3', async ({
        cajero,
        kardexApi,
        cajasApi,
    }) => {
        const page = cajero.habilidad(UsarNavegador).page;

        // 1) Iniciar venta en caja y seleccionar Nota de Venta
        const cajaPage = new CajaPage(page);
        const comprobantePage = new ComprobantePage(page);
        const emisionPage = new EmisionPage(page);
        const postEmisionPage = new PostEmisionPage(page);
        const nombreCaja = cajaPage.nombreCajaActiva;

        await cajaPage.continuarVendiendo();
        await comprobantePage.seleccionarNotaVenta();

        // Capturar stock del item estricto ANTES de agregar items
        const stockOriginal = await capturarStockNC(kardexApi, ITEMS_PV.ESTRICTO_GRAVADO_2.codigo);

        // Agregar item manual (PRODUCTO_MANUAL) — usa flujo drawer
        await AgregarProductoManual({
            nombre: PRODUCTO_MANUAL.nombre,
            cantidad: PRODUCTO_MANUAL.cantidad,
            precioBase: PRODUCTO_MANUAL.precioBase,
            precioFinal: PRODUCTO_MANUAL.precioFinal,
            guardarEnLista: PRODUCTO_MANUAL.guardarEnLista,
        })(page);

        // Agregar item estricto (control de stock) — buscar por código dinámico
        await emisionPage.buscarItem(ITEMS_PV.ESTRICTO_GRAVADO_2.codigo);
        await emisionPage.seleccionarItem(ITEMS_PV.ESTRICTO_GRAVADO_2.nombre);

        // Capturar monto inicial de la caja
        const montoInicial = await capturarMontoCaja(cajasApi, undefined, nombreCaja);

        // Emitir Nota de Venta con efectivo exacto
        const resumen = await emisionPage.capturarResumenPedido();
        const montoTotalCarrito = parseFloat(resumen['Total'] ?? resumen['TOTAL'] ?? '0') || 0;
        await emisionPage.emitirConEfectivoExacto();

        const emision = emisionPage.ultimaEmision;
        if (!emision?.correlativo) {
            throw new Error('No se obtuvo correlativo tras emitir la Nota de Venta');
        }
        const numeroCompleto = `${emision.serie}-${emision.correlativo}`;
        const correlativo = emision.correlativo;

        await postEmisionPage.clickNuevaVenta();
        await recargarSiHayError(page);
        const stockDespuesVenta = await esperarStockDespuesVenta({
            kardexApi,
            codigoProducto: ITEMS_PV.ESTRICTO_GRAVADO_2.codigo,
            stockOriginal,
            cantidadVendida: ITEMS_PV.ESTRICTO_GRAVADO_2.cantidad,
        });

        await validarMontoCajaDespuesVenta({
            cajasApi,
            montoInicial,
            montoTotalVenta: montoTotalCarrito,
            nombreCaja,
        });

        // Anular desde Búsqueda
        await cajero.realiza(
            AnularNotaVentaDesdeBusqueda({
                correlativo,
                numeroCompleto,
                motivo: BC_MOTIVOS_ELIMINACION.ERROR_DATOS,
            })
        );

        await cajero.realiza(
            VerificarRetornoStock({
                item: ITEMS_PV.ESTRICTO_GRAVADO_2,
                kardexApi,
                stockOriginal,
                stockDespuesVenta,
            }),
            VerificarRetornoDineroCaja({
                cajasApi,
                montoInicial,
                nombreCaja,
            }),
            VerificarComprobanteAnulado({numeroCompleto}),
        );
    });
});