import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-01 | Emisión con control de stock y datos adicionales @PV-01', {tag: ['@punto-venta', '@factura', '@stock']}, () => {

    // ─── Helper: seleccionar factura + cliente RUC ────────────────────
    async function setupFacturaConClienteRUC(
        comprobantePage: any, clientePage: any, page: any,
    ) {
        await comprobantePage.seleccionarFactura();
        await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
        await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
        await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
    }

    test('Emitir factura con producto con control de stock @PV-01.7', async ({
                                                                                cajaPage,
                                                                                comprobantePage,
                                                                                emisionPage,
                                                                                clientePage,
                                                                                kardexApi,
                                                                                busquedaComprobantes,
                                                                                page,
                                                                            }) => {
        let saldoAntes = 0;

        await test.step('Given: caja abierta y tipo FACTURA con cliente RUC', async () => {
            await cajaPage.asegurarCajaAbierta();
            await setupFacturaConClienteRUC(comprobantePage, clientePage, page);
        });

        await test.step('And: capturar stock actual', async () => {
            saldoAntes = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_PV.PRODUCTO_SIMPLE.codigo,
                almacenFiltro: 'AUTO',
            });
        });

        await test.step('When: agregar producto, editar precio a 50 y emitir', async () => {
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_SIMPLE.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_SIMPLE.nombre);
            await emisionPage.editarPrecioItem('50');
            await emisionPage.abrirSelectorFecha();
            // Seleccionar fecha dentro de últimos 3 días (dinámico)
            await page.locator('.v-calendar .day.is-today').click().catch(() => {
            });
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: comprobante emitido', async () => {
            await emisionPage.clickNuevaVenta();
        });

        await test.step('And: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
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

        await test.step('And: stock disminuyó en 1', async () => {
            const saldoDespues = await kardexApi.obtenerSaldoPorProducto({
                codigoProducto: ITEMS_PV.PRODUCTO_SIMPLE.codigo,
                almacenFiltro: 'AUTO',
            });
            expect(saldoDespues).toBe(saldoAntes - 1);
        });
    });

    test('Bloquear factura sin cliente RUC @PV-01.8', async ({
                                                                cajaPage, comprobantePage, emisionPage, page,
                                                            }) => {
        await test.step('Given: caja abierta, FACTURA sin cliente', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
        });

        await test.step('And: agregar producto', async () => {
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
        });

        await test.step('When: intentar pagar', async () => {
            await emisionPage.clickPagar();
        });

        await test.step('Then: bloqueo por falta de RUC', async () => {
            await expect(
                page.getByText('Selecciona un cliente con RUC para emitir una factura'),
            ).toBeVisible();
            await emisionPage.clickAceptarError();
        });
    });

    test('Emitir factura con ítem afecto a ISC @PV-01.9', async ({
                                                                    cajaPage,
                                                                    comprobantePage,
                                                                    emisionPage,
                                                                    busquedaComprobantes,
                                                                    page,
                                                                }) => {
        await test.step('Given: FACTURA con cliente RUC e ítem ISC', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_ISC.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_ISC.nombre);
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
        });

        await test.step('When: verificar ISC en totales y emitir', async () => {
            await emisionPage.abrirTotales();
            await expect(page.getByText('ISC1.50')).toBeVisible();
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: factura emitida con ISC', async () => {
            await emisionPage.clickNuevaVenta();
        });

        await test.step('And: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        const estadoSunat = await test.step('And: validar estado SUNAT desde API de Consultas', async () => {
            return await busquedaComprobantes.validarEstadoSunat();
        });

        await test.step('And: abrir bitácora y verificar', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitido(estadoSunat);
            await busquedaComprobantes.cerrarBitacora();
        });
    });

    test('Emitir factura con ítem afecto a ICBPER @PV-01.10', async ({
                                                                       cajaPage,
                                                                       comprobantePage,
                                                                       emisionPage,
                                                                       busquedaComprobantes,
                                                                       page,
                                                                   }) => {
        await test.step('Given: FACTURA con cliente RUC e ítem ICBPER', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_ICBPER.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_ICBPER.nombre);
        });

        await test.step('When: verificar ICBPER en totales y emitir', async () => {
            await emisionPage.abrirTotales();
            await expect(page.getByText('ICBPER0.50')).toBeVisible();
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: factura emitida con ICBPER', async () => {
            await emisionPage.clickNuevaVenta();
        });

        await test.step('And: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        const estadoSunat = await test.step('And: validar estado SUNAT desde API de Consultas', async () => {
            return await busquedaComprobantes.validarEstadoSunat();
        });

        await test.step('And: abrir bitácora y verificar', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitido(estadoSunat);
            await busquedaComprobantes.cerrarBitacora();
        });
    });

    // ─── Bloquear factura con fecha fuera de rango ────────────────────
    test('Bloquear emisión de factura con fecha fuera del rango permitido @PV-01.11', async ({
                                                                                                cajaPage,
                                                                                                comprobantePage,
                                                                                                emisionPage,
                                                                                                page,
                                                                                            }) => {
        await test.step('Given: caja abierta, FACTURA con cliente RUC y producto', async () => {
            await cajaPage.continuarVendiendo();
            await setupFacturaConClienteRUC(comprobantePage, null, page);
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
        });

        let fechaAntes = '';
        await test.step('And: capturar la fecha actual mostrada', async () => {
            fechaAntes = await emisionPage.obtenerFechaMostrada();
        });

        await test.step('When: intentar seleccionar una fecha con más de 3 días de antigüedad', async () => {
            await emisionPage.clickFechaFueraDeRango(3);
        });

        await test.step('Then: la fecha mostrada NO debe haber cambiado', async () => {
            const fechaDespues = await emisionPage.obtenerFechaMostrada();
            expect(fechaDespues).toBe(fechaAntes);
        });
    });
});
