import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {esperarCargaOverlay} from '@utils/wait-helpers';

test.describe('PV-01 | Emisión con control de stock y datos adicionales @PV-01', {tag: ['@punto-venta', '@boleta', '@stock']}, () => {

    test('Emitir boleta con producto con control de stock y validar SUNAT @PV-01.1', async ({
                                                                                                cajaPage,
                                                                                                comprobantePage,
                                                                                                emisionPage,
                                                                                                busquedaComprobantes,
                                                                                                sunatApi,
                                                                                                kardexApi,
                                                                                                page,
                                                                                            }) => {
        let saldoAntes = 0;

        await test.step('Given: la caja está abierta', async () => {
            await cajaPage.continuarVendiendo();
        });
        await test.step('And: seleccionar tipo de comprobante BOLETA', async () => {
            await comprobantePage.seleccionarBoleta();
        });
        await test.step('And: capturar stock actual del producto vía API', async () => {
            saldoAntes = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_PV.PRODUCTO_GRAVADO.codigo,
                almacenFiltro: 'AUTO',
            });
        });
        await test.step('When: agregar producto y emitir con efectivo', async () => {
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
            await emisionPage.emitirConEfectivoExacto();
        });
        await test.step('And: click Nueva Venta', async () => {
            await emisionPage.clickNuevaVenta();
        });
        
        await test.step('Then: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        const estadoSunat = await test.step('And: validar estado SUNAT desde API de Consultas', async () => {
            return await busquedaComprobantes.validarEstadoSunat();
        });

        await test.step('And: abrir bitácora y verificar descargo de inventarios', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitido(estadoSunat);
            await busquedaComprobantes.validarDescargoInventarios();
            await busquedaComprobantes.cerrarBitacora();
        });

        await test.step('And: verificar que el stock disminuyó vía API', async () => {
            const saldoDespues = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_PV.PRODUCTO_GRAVADO.codigo,
                almacenFiltro: 'AUTO',
            });
            expect(saldoDespues).toBe(saldoAntes - 1);
        });
    });

    test('Emitir boleta sin cliente con monto menor a 700 @PV-01.2', async ({
                                                                                cajaPage,
                                                                                emisionPage,
                                                                                busquedaComprobantes,
                                                                            }) => {
        await test.step('Given: caja abierta', async () => {
            await cajaPage.continuarVendiendo();
        });

        await test.step('When: agregar producto y emitir con efectivo', async () => {
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
            await emisionPage.incrementarCantidad(2);
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('And: click Nueva Venta', async () => {
            await emisionPage.clickNuevaVenta();
        });

        await test.step('Then: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        const estadoSunat = await test.step('And: validar estado SUNAT desde API de Consultas', async () => {
            return await busquedaComprobantes.validarEstadoSunat();
        });

        await test.step('And: abrir bitácora y verificar emisión', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitido(estadoSunat);
            await busquedaComprobantes.cerrarBitacora();
        });
    });

    test('Emitir boleta con combo con control de stock @PV-01.4', async ({
                                                                             cajaPage,
                                                                             emisionPage,
                                                                             busquedaComprobantes,
                                                                         }) => {
        await test.step('Given: caja abierta', async () => {
            await cajaPage.continuarVendiendo();
        });

        await test.step('When: agregar combo y emitir', async () => {
            await emisionPage.buscarItem(ITEMS_PV.COMBO_ESTRICTO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.COMBO_ESTRICTO.nombre);
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('And: click Nueva Venta', async () => {
            await emisionPage.clickNuevaVenta();
        });

        await test.step('Then: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        const estadoSunat = await test.step('And: validar estado SUNAT desde API de Consultas', async () => {
            return await busquedaComprobantes.validarEstadoSunat();
        });

        await test.step('And: abrir bitácora y verificar emisión y descargo', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitido(estadoSunat);
            await busquedaComprobantes.validarDescargoInventarios();
            await busquedaComprobantes.cerrarBitacora();
        });
    });

    test('Emitir boleta con datos adicionales @PV-01.5', async ({
                                                                    cajaPage,
                                                                    emisionPage,
                                                                    emisionDatosOpcionalesPage,
                                                                    busquedaComprobantes,
                                                                    clientePage,
                                                                    page,
                                                                }) => {
        await test.step('Given: caja abierta y producto agregado', async () => {
            await cajaPage.continuarVendiendo();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
        });

        await test.step('When: abrir datos opcionales y llenarlos', async () => {
            await emisionDatosOpcionalesPage.abrirDatosOpcionales();
            await emisionDatosOpcionalesPage.llenarDatosOpcionales(CLIENTES.PERSONA_AUTO);
        });

        await test.step('And: emitir con efectivo', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('And: click Nueva Venta', async () => {
            await emisionPage.clickNuevaVenta();
        });

        await test.step('Then: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        const estadoSunat = await test.step('And: validar estado SUNAT desde API de Consultas', async () => {
            return await busquedaComprobantes.validarEstadoSunat();
        });
        await test.step('And: Verificar en busqueda de comprobantes', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitido(estadoSunat);
            await busquedaComprobantes.cerrarBitacora();
        })

        await test.step('And: abrir Ver comprobante y verificar datos opcionales', async () => {
            const popup = await busquedaComprobantes.abrirVerComprobante();
            await esperarCargaOverlay(popup);
            await busquedaComprobantes.clickAccionesExtra(popup);
            await busquedaComprobantes.clickDatosOpcionales(popup);
            await busquedaComprobantes.cerrarDrapePopup(popup);
        });
    });
});
