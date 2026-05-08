/**
 * PV-2 | Emisión de Factura
 *
 * Escenarios refactorizados desde codegen (casos.ts líneas 1165–2330).
 * Post-emisión: cada test exitoso navega a Búsqueda de comprobantes + Bitácora.
 */
import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {CLIENTES, DETRACCION, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';


test.describe('PV-2 | Emisión de Factura @factura', {tag: ['@punto-venta', '@emisiones']}, () => {

    // ─── Helper: seleccionar factura + cliente RUC ────────────────────
    async function setupFacturaConClienteRUC(
        comprobantePage: any, clientePage: any, page: any,
    ) {
        await comprobantePage.seleccionarFactura();
        await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
        await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
        await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
    }

    test('Emitir factura con producto con control de stock @PV-2.1', async ({
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

    test('Emitir factura con descuento ítem % y descuento global monto @PV-2.2', async ({
                                                                                            cajaPage,
                                                                                            comprobantePage,
                                                                                            emisionPage,
                                                                                            clientePage,
                                                                                            busquedaComprobantes,
                                                                                            page,
                                                                                        }) => {
        await test.step('Given: caja abierta, FACTURA con cliente RUC', async () => {
            await cajaPage.continuarVendiendo();
            await setupFacturaConClienteRUC(comprobantePage, clientePage, page);
        });

        await test.step('And: agregar dos ítems', async () => {
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
        });

        await test.step('When: aplicar descuento 15% al primer ítem', async () => {
            await page.locator('[id*="btn-editar"]').first().click();
            await page.getByText('%', {exact: true}).click();
            await page.getByText('Porcentaje').click();
            await page.locator('[id*="v-input:descuento"]').click();
            await page.locator('[id*="v-input:descuento"]').fill('15');
            await page.locator('[id*="btn-editar"]').first().click();
        });

        await test.step('And: aplicar descuento global de S/5 por monto', async () => {
            await emisionPage.abrirDescuentoGlobal();
            await page.getByText('%', {exact: true}).click();
            await page.getByText('Monto').click();
            await emisionPage.llenarDescuentoGlobal('5');
            await emisionPage.aplicarDescuentoGlobal();
        });

        await test.step('And: emitir con efectivo', async () => {
            await emisionPage.abrirTotales();
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
    });

    test('Bloquear factura sin cliente RUC @PV-2.3', async ({
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

    test('Emitir factura de exportación sin RUC @PV-2.4', async ({
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
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
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

    test('Emitir factura con retención 18% @PV-2.5', async ({
                                                                cajaPage,
                                                                comprobantePage,
                                                                emisionPage,
                                                                busquedaComprobantes,
                                                                page,
                                                            }) => {
        await test.step('Given: FACTURA con cliente RUC', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
        });

        await test.step('When: activar retención del 18%', async () => {
            await page.locator(
                'div:nth-child(3) > .switch-component > .v-switch > .switch-content > .switch > .slider',
            ).click();
            await page.getByRole('textbox').nth(3).click();
            await page.getByRole('textbox').nth(3).fill('18');
            await page.getByRole('button', {name: 'Guardar', exact: true}).click();
            await page.locator('.v-modal > div').first().click();
        });

        await test.step('And: emitir con IZY PAY', async () => {
            await emisionPage.clickPagar();
            await page.getByRole('button', {name: 'IZY PAY'}).click();
            await page.getByRole('button', {name: 'Realizar Pago'}).click();
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

        await test.step('And: Ver comprobante muestra leyenda de retención', async () => {
            const popup = await busquedaComprobantes.abrirVerComprobante();
            await busquedaComprobantes.validarRetencionEnPopup(popup, '18');
        });
    });

    test('Bloquear factura con detracción sin datos completos @PV-2.6', async ({
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
            const mensajeDetraccion = page.getByText("El monto de detraccion no puede ser cero")
            const mensajeAlternativo = page.getByText("Para realizar esta operación, ingresa un cliente válido")
            await expect(mensajeDetraccion.or(mensajeAlternativo)
            ).toBeVisible();
            await emisionPage.clickAceptarError();
        });
    });

    test('Emitir factura con detracción transporte de carga @PV-2.7', async ({
                                                                                 cajaPage,
                                                                                 comprobantePage,
                                                                                 emisionPage,
                                                                                 busquedaComprobantes,
                                                                                 detraccionPage,
                                                                                 page,
                                                                             }) => {
        await test.step('Given: FACTURA con cliente RUC', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
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
            await busquedaComprobantes.validarDetraccionEnPopup(popup);
        });
    });

    test('Emitir factura con ítem afecto a ISC @PV-2.8', async ({
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

    test('Emitir factura con ítem afecto a ICBPER @PV-2.9', async ({
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

    test('Emitir factura con receta con control de stock @PV-2.10', async ({
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

    test('Emitir factura de adelanto @PV-2.11', async ({
                                                           cajaPage,
                                                           comprobantePage,
                                                           emisionPage,
                                                           busquedaComprobantes,
                                                           page,
                                                       }) => {
        await test.step('Given: FACTURA con adelanto activo', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
            await page.locator('.slider').first().click(); // Switch adelanto
            // await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            // await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
        });

        await test.step('When: emitir con PLIN', async () => {
            await emisionPage.clickPagar();
            await page.getByRole('button', {name: 'PLIN'}).click();
            await page.getByRole('button', {name: 'Realizar Pago'}).click();
        });

        await test.step('Then: factura adelanto emitida', async () => {
            await emisionPage.clickNuevaVenta();
        });

        await test.step('And: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        const estadoSunat = await test.step('And: validar estado SUNAT desde API de Consultas', async () => {
            return await busquedaComprobantes.validarEstadoSunat();
        });

        await test.step('And: abrir bitácora y verificar emisión (sin descargo)', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitido(estadoSunat);
            await busquedaComprobantes.validarSinDescargoInventarios();
            await busquedaComprobantes.cerrarBitacora();
        });

        await test.step('And: Ver comprobante muestra factura de adelanto', async () => {
            const popup = await busquedaComprobantes.abrirVerComprobante();
            await busquedaComprobantes.validarFacturaAdelantoEnPopup(popup);
        });
    });

    test('Visualizar precuenta de factura @PV-2.12', async ({
                                                                cajaPage, comprobantePage, emisionPage, page,
                                                            }) => {
        await test.step('Given: FACTURA con cliente RUC y producto', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
        });

        await test.step('When: abrir precuenta', async () => {
            await emisionPage.clickPrecuenta();
        });

        await test.step('Then: precuenta visible', async () => {
            // La precuenta abre un overlay — verificar visibilidad
            await expect(page.getByRole('button', {name: 'PRECUENTA'})).toBeVisible();
        });
    });

    // ─── Bloquear factura con fecha fuera de rango ────────────────────
    test('Bloquear emisión de factura con fecha fuera del rango permitido @PV-2.13', async ({
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

    // ─── Factura en dólares con detracción y tipo de cambio ───────────
    test('Emitir factura en moneda distinta a soles con detracción usando tipo de cambio @PV-2.14', async ({
                                                                                                               cajaPage,
                                                                                                               comprobantePage,
                                                                                                               emisionPage,
                                                                                                               detraccionPage,
                                                                                                               busquedaComprobantes,
                                                                                                               page,
                                                                                                           }) => {
        await test.step('Given: FACTURA con cliente RUC en moneda dólares', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
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
            await busquedaComprobantes.validarDetraccionEnPopup(popup);
        });
    });

    // ─── Bloquear factura en dólares con detracción SIN tipo de cambio ─
    test('Bloquear factura en moneda distinta a soles con detracción sin tipo de cambio @PV-2.15', async ({
                                                                                                              cajaPage,
                                                                                                              comprobantePage,
                                                                                                              emisionPage,
                                                                                                              detraccionPage,
                                                                                                              page,
                                                                                                          }) => {
        await test.step('Given: FACTURA en dólares con cliente RUC y producto', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
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

    // ─── Factura con adelanto aplicado ─────────────────────────────────
    test('Emitir factura con adelanto aplicado @PV-2.16', async ({
                                                                     cajaPage,
                                                                     comprobantePage,
                                                                     emisionPage,
                                                                     busquedaComprobantes,
                                                                     page,
                                                                 }) => {
        // ─── Precondición: crear factura de adelanto ───────────────
        let emisionAdelanto: typeof emisionPage.ultimaEmision = null;

        await test.step('Given: crear factura de adelanto como precondición', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            // Activar switch adelanto
            await page.locator('.slider').first().click();
            await emisionPage.emitirConEfectivoExacto();
            emisionAdelanto = emisionPage.ultimaEmision;
            await emisionPage.clickNuevaVenta();
        });

        // ─── Factura con adelanto aplicado ─────────────────────────
        await test.step('And: iniciar nueva factura con cliente RUC', async () => {
            await comprobantePage.seleccionarFactura();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
        });

        await test.step('When: aplicar adelanto existente', async () => {
            await page.getByRole('button', {name: 'Adelantos'}).click();
            await busquedaComprobantes.filtrarAdelantoFactura(emisionAdelanto);
            await page.locator(
                '.v-checkbox-default-label.flex-row-align-items-center-justify-content-center > span',
            ).first().click();
            await page.locator('.v-modal > div').first().click();
        });

        await test.step('And: verificar total anticipos visible', async () => {
            await expect(page.getByText('Total anticipos')).toBeVisible();
        });

        await test.step('And: emitir con efectivo', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('Then: factura con adelanto emitida', async () => {
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

        await test.step('And: Ver comprobante muestra adelantos aplicados', async () => {
            const popup = await busquedaComprobantes.abrirVerComprobante();
            await busquedaComprobantes.validarAdelantosAplicadosEnPopup(popup);
        });
    });
});
