import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {CLIENTES, DETRACCION, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {esperarCargaOverlaySiVisible} from '@utils/wait-helpers';

test.describe('PV-17 | Emitir comprobante con detracción', {tag: ['@punto-venta', '@factura', '@detraccion']}, () => {

    async function setupFacturaConClienteRUC(
        comprobantePage: any, page: any,
    ) {
        await comprobantePage.seleccionarFactura();
        await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
        await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
        await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
    }

    test('SC-01: Bloquear factura con detracción sin datos completos @PV-17.1', async ({
                                                                                    cajaPage,
                                                                                    comprobantePage,
                                                                                    emisionPage,
                                                                                    page,
                                                                                }) => {
        await test.step('Given: FACTURA con detracción activada sin datos', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            await page.locator(
                'div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider',
            ).click();
        });

        await test.step('When: intentar pagar sin datos de detracción', async () => {
            await emisionPage.clickPagar();
        });

        await test.step('Then: bloqueo por detracción incompleta', async () => {
            const mensajeDetraccion = page.getByText("El monto de detracción no puede ser cero")
            const mensajeAlternativo = page.getByText("Para realizar esta operación, ingresa un cliente válido")
            await expect(mensajeDetraccion.or(mensajeAlternativo)
            ).toBeVisible();
            await emisionPage.clickAceptarError();
        });
    });

    test('SC-02: Emitir factura con detracción transporte de carga @PV-17.2', async ({
                                                                                  cajaPage,
                                                                                  comprobantePage,
                                                                                  emisionPage,
                                                                                  busquedaComprobantes,
                                                                                  detraccionPage,
                                                                                  page,
                                                                              }) => {
        await test.step('Given: FACTURA con cliente RUC', async () => {
            await cajaPage.continuarVendiendo();
            await setupFacturaConClienteRUC(comprobantePage, page);
            await emisionPage.buscarItem(ITEMS_PV.ESTRICTO_GRAVADO_8.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ESTRICTO_GRAVADO_8.nombre);
        });

        await test.step('When: configurar detracción transporte de carga', async () => {
            await detraccionPage.activarDetraccion();
            await detraccionPage.configurarTransporteCarga({
                tipoOperacion: DETRACCION.TIPOS_OPERACION.TRANSPORTE_CARGA,
                metodoPago: 'Giro',
                porcentaje: '25',
                numeroCuenta: '75-848-2174',
                origen: {ubigeo: 'arequipa', texto: '- Arequipa - Arequipa - Arequipa', direccion: 'arequipa'},
                destino: {ubigeo: 'juliaca', texto: '- Juliaca - San Roman - Puno', direccion: 'arequipa'},
                valorTransporte: '10',
                cargaEfectiva: '2',
                cargaUtil: '3',
                detalleViaje: 'factura detraccion transporte carga auto',
            });
        });

        await test.step('And: emitir con efectivo', async () => {
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

        await test.step('And: abrir bitácora y verificar emisión', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitido(estadoSunat);
            await busquedaComprobantes.cerrarBitacora();
        });

        await test.step('And: Ver comprobante muestra leyenda de detracción', async () => {
            const popup = await busquedaComprobantes.abrirVerComprobante();
            await esperarCargaOverlaySiVisible(popup);
            await busquedaComprobantes.validarDetraccionEnPopup(popup);
        });
    });

    test('SC-03: Emitir factura en moneda distinta a soles con detracción usando tipo de cambio @PV-17.3', async ({
                                                                                                               cajaPage,
                                                                                                               comprobantePage,
                                                                                                               emisionPage,
                                                                                                               detraccionPage,
                                                                                                               busquedaComprobantes,
                                                                                                               page,
                                                                                                           }) => {
        await test.step('Given: FACTURA con cliente RUC en moneda dólares', async () => {
            await cajaPage.continuarVendiendo();
            await setupFacturaConClienteRUC(comprobantePage, page);
            await emisionPage.buscarItem(ITEMS_PV.ESTRICTO_GRAVADO_8.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ESTRICTO_GRAVADO_8.nombre);
            await emisionPage.seleccionarMonedaDolares();
        });

        await test.step('And: editar precio a $150', async () => {
            await emisionPage.editarPrecioItem('150');
        });

        await test.step('When: configurar detracción simple 25%', async () => {
            await detraccionPage.activarDetraccion();
            await detraccionPage.configurarDetraccionSimple({
                porcentaje: '25',
                numeroCuenta: '75-964-78517',
            });
        });

        await test.step('And: ingresar tipo de cambio y emitir', async () => {
            await emisionPage.llenarTipoCambio('3.7');
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

        await test.step('And: abrir bitácora y verificar emisión', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitido(estadoSunat);
            await busquedaComprobantes.cerrarBitacora();
        });

        await test.step('And: Ver comprobante muestra leyenda de detracción', async () => {
            const popup = await busquedaComprobantes.abrirVerComprobante();
            await esperarCargaOverlaySiVisible(popup);
            await busquedaComprobantes.validarDetraccionEnPopup(popup);
        });
    });

    test('SC-04: Bloquear factura en moneda distinta a soles con detracción sin tipo de cambio @PV-17.4', async ({
                                                                                                              cajaPage,
                                                                                                              comprobantePage,
                                                                                                              emisionPage,
                                                                                                              detraccionPage,
                                                                                                              page,
                                                                                                          }) => {
        await test.step('Given: FACTURA en dólares con cliente RUC y producto', async () => {
            await cajaPage.continuarVendiendo();
            await setupFacturaConClienteRUC(comprobantePage, page);
            await emisionPage.buscarItem(ITEMS_PV.ESTRICTO_GRAVADO_8.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ESTRICTO_GRAVADO_8.nombre);
            await emisionPage.seleccionarMonedaDolares();
        });

        await test.step('And: editar precio a $150', async () => {
            await emisionPage.editarPrecioItem('150');
        });

        await test.step('When: configurar detracción sin ingresar tipo de cambio', async () => {
            await detraccionPage.activarDetraccion();
            await detraccionPage.configurarDetraccionSimple({
                porcentaje: '25',
                numeroCuenta: '45-284-71523',
            });
        });

        await test.step('And: intentar pagar sin tipo de cambio', async () => {
            await emisionPage.clickPagar();
        });

        await test.step('Then: debe mostrar validación de tipo de cambio obligatorio', async () => {
            await expect(
                page.getByText('Falta tipo de cambio en'),
            ).toBeVisible();
            await emisionPage.clickAceptarError();
        });
    });
});
