import {test} from '@fixtures/PuntoVenta/validacion-fixture';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-16 | Emitir comprobante de exportación con receta', {tag: ['@punto-venta', '@factura', '@exportacion']}, () => {

    test('SC-01: Emitir factura de exportación sin RUC @PV-16.1', async ({
                                                                      cajaPage,
                                                                      comprobantePage,
                                                                      emisionPage,
                                                                      busquedaComprobantes,
                                                                      page,
                                                                  }) => {
        await test.step('Given: caja abierta, FACTURA con switch exportación', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
        });

        await test.step('And: agregar producto y activar exportación', async () => {
            await emisionPage.buscarItem(ITEMS_PV.ESTRICTO_GRAVADO_7.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ESTRICTO_GRAVADO_7.nombre);
            await page.locator(
                'div:nth-child(4) > .switch-component > .v-switch > .switch-content > .switch > .slider',
            ).click();
        });

        await test.step('When: emitir con efectivo', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: factura exportación emitida', async () => {
            await emisionPage.clickNuevaVenta();
        });

        await test.step('And: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
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

    test('SC-02: Emitir factura con receta con control de stock @PV-16.2', async ({
                                                                               cajaPage,
                                                                               comprobantePage,
                                                                               emisionPage,
                                                                               busquedaComprobantes,
                                                                               page,
                                                                           }) => {
        await test.step('Given: FACTURA con cliente RUC y receta', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
            await emisionPage.buscarItem(ITEMS_PV.RECETA_INSUMOS.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.RECETA_INSUMOS.nombre);
        });

        await test.step('When: emitir con efectivo', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: factura emitida', async () => {
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
    });
});
