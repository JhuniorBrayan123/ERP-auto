import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-1 | Emisión de Boleta @boleta', {tag: ['@punto-venta', '@emisiones']}, () => {

    // ─── Boleta con stock (Patrón B: Bitácora + Stock + Kardex) ───────
    test('Emitir boleta con producto con control de stock y validar SUNAT @PV-1.1', async ({
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
            await cajaPage.asegurarCajaAbierta();
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
        // ─── Post-emisión: Búsqueda filtrada + SUNAT + Bitácora ───
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

    // ─── Boleta sin cliente < 700 (Patrón A: solo Bitácora) ──────────
    test('Emitir boleta sin cliente con monto menor a 700 @PV-1.2', async ({
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

        // ─── Post-emisión: Búsqueda filtrada + SUNAT + Bitácora ───
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

    // ─── Bloquear boleta sin cliente >= 700 (NO va a búsqueda) ────────
    test('Bloquear emisión de boleta sin cliente para montos >= 700 @PV-1.3', async ({
                                                                                         cajaPage, emisionPage, page,
                                                                                     }) => {
        await test.step('Given: la caja está abierta', async () => {
            await cajaPage.asegurarCajaAbierta();
        });

        await test.step('And: agregar producto y editar precio a 750', async () => {
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
            await emisionPage.editarPrecioItem('750.00');
        });

        await test.step('When: intentar pagar sin cliente', async () => {
            await emisionPage.clickPagar();
        });

        await test.step('Then: debe mostrar validación de monto mayor a 700', async () => {
            await expect(
                page.getByText('Selecciona un cliente para montos mayores a S/700'),
            ).toBeVisible();
        });

        await test.step('And: cerrar error', async () => {
            await emisionPage.clickAceptarError();
        });
    });

    // ─── Boleta descuento ítem monto (Patrón A: Bitácora) ─────────────
    test('Emitir boleta con descuento por ítem por monto @PV-1.4', async ({
                                                                              cajaPage,
                                                                              emisionPage,
                                                                              busquedaComprobantes,
                                                                          }) => {
        await test.step('Given: caja abierta y producto agregado', async () => {
            await cajaPage.continuarVendiendo();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
            await emisionPage.incrementarCantidad(7);
        });

        await test.step('When: aplicar descuento por ítem de S/5 en monto', async () => {
            await emisionPage.abrirEdicionItem();
            await emisionPage.seleccionarTipoDescuentoMonto();
            await emisionPage.llenarDescuentoItem('5');
            await emisionPage.cerrarEdicionItem();
        });

        await test.step('And: emitir con YAPE', async () => {
            await emisionPage.emitirConYape();
        });

        await test.step('And: click Nueva Venta', async () => {
            await emisionPage.clickNuevaVenta();
        });

        // ─── Post-emisión: Búsqueda filtrada + SUNAT + Bitácora ───
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

    // ─── Boleta descuento global porcentaje (Patrón A: Bitácora) ──────
    test('Emitir boleta con descuento global por porcentaje @PV-1.5', async ({
                                                                                 cajaPage,
                                                                                 emisionPage,
                                                                                 busquedaComprobantes,
                                                                             }) => {
        await test.step('Given: caja abierta y producto con cantidad 10', async () => {
            await cajaPage.continuarVendiendo();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
            await emisionPage.incrementarCantidad(9);
        });

        await test.step('When: aplicar descuento global del 50%', async () => {
            await emisionPage.abrirDescuentoGlobal();
            await emisionPage.llenarDescuentoGlobal('50');
            await emisionPage.aplicarDescuentoGlobal();
        });

        await test.step('And: emitir con efectivo', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('And: click Nueva Venta', async () => {
            await emisionPage.clickNuevaVenta();
        });

        // ─── Post-emisión: Búsqueda filtrada + SUNAT + Bitácora ───
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

    // ─── Boleta descuento ítem + global (Patrón B: Bitácora + Stock) ──
    test('Emitir boleta con descuento ítem porcentaje + descuento global @PV-1.6', async ({
                                                                                              cajaPage,
                                                                                              emisionPage,
                                                                                              busquedaComprobantes,
                                                                                              page,
                                                                                          }) => {
        await test.step('Given: caja abierta y producto agregado', async () => {
            await cajaPage.continuarVendiendo();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
        });

        await test.step('When: aplicar descuento por ítem del 2% en porcentaje', async () => {
            await emisionPage.abrirEdicionItem();
            await page.getByText('%', {exact: true}).click();
            await page.getByText('Porcentaje').click();
            await page.locator('[id*="v-input:descuento"]').fill('2');
            await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]').click();
        });

        await test.step('And: aplicar descuento global del 2%', async () => {
            await emisionPage.abrirDescuentoGlobal();
            await emisionPage.llenarDescuentoGlobal('2');
            await emisionPage.aplicarDescuentoGlobal();
        });

        await test.step('And: verificar totales y emitir con efectivo', async () => {
            await emisionPage.abrirTotales();
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('And: click Nueva Venta', async () => {
            await emisionPage.clickNuevaVenta();
        });

        // ─── Post-emisión: Búsqueda filtrada + SUNAT + Bitácora ───
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

    // ─── Boleta con equivalencia (Patrón A: Bitácora) ─────────────────
    test('Emitir boleta con ítem con equivalencia @PV-1.7', async ({
                                                                       cajaPage,
                                                                       emisionPage,
                                                                       busquedaComprobantes,
                                                                       page,
                                                                   }) => {
        await test.step('Given: caja abierta', async () => {
            await cajaPage.continuarVendiendo();
        });

        await test.step('When: agregar ítem con equivalencia y seleccionar Equivalente X2', async () => {
            await emisionPage.buscarItem('202020');
            await emisionPage.seleccionarItem('item equivalente flexible');
            await page.getByText('Equivalente X2').click();
            await page.locator('.cmp-informacion-item > div').first().click();
        });

        await test.step('And: emitir con efectivo', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('And: click Nueva Venta', async () => {
            await emisionPage.clickNuevaVenta();
        });

        // ─── Post-emisión: Búsqueda filtrada + SUNAT + Bitácora ───
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

    // ─── Boleta con combo (Patrón A: Bitácora) ────────────────────────
    test('Emitir boleta con combo con control de stock @PV-1.8', async ({
                                                                            cajaPage, emisionPage, busquedaComprobantes,
                                                                        }) => {
        await test.step('Given: caja abierta', async () => {
            await cajaPage.continuarVendiendo();
        });

        await test.step('When: agregar combo y emitir', async () => {
            await emisionPage.buscarItem('222222');
            await emisionPage.seleccionarItem('combo hijo exonegaro item');
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('And: click Nueva Venta', async () => {
            await emisionPage.clickNuevaVenta();
        });

        // ─── Post-emisión: Búsqueda filtrada + SUNAT + Bitácora ───
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

    // ─── Boleta adelanto (Patrón A: Bitácora SIN descargo) ────────────
    test('Emitir boleta de adelanto @PV-1.9', async ({
                                                         cajaPage, emisionPage, busquedaComprobantes, page,
                                                     }) => {
        await test.step('Given: caja abierta y producto agregado', async () => {
            await cajaPage.continuarVendiendo();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
        });

        await test.step('When: activar switch adelanto', async () => {
            await page.locator(
                'div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider',
            ).click();
        });

        await test.step('And: emitir con efectivo', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('And: click Nueva Venta', async () => {
            await emisionPage.clickNuevaVenta();
        });

        // ─── Post-emisión: Búsqueda filtrada + SUNAT + Bitácora (sin descargo) ───
        await test.step('Then: ir a Búsqueda de comprobantes filtrado por correlativo', async () => {
            await busquedaComprobantes.navegarABusquedaComprobantes(emisionPage.ultimaEmision);
        });

        const estadoSunat = await test.step('And: validar estado SUNAT desde API de Consultas', async () => {
            return await busquedaComprobantes.validarEstadoSunat();
        });

        await test.step('And: abrir bitácora y verificar emisión', async () => {
            await busquedaComprobantes.abrirBitacoraDelPrimerComprobante();
            await busquedaComprobantes.validarComprobanteEmitido(estadoSunat);
        });

        await test.step('And: bitácora NO debe mostrar descargo de inventarios', async () => {
            await busquedaComprobantes.validarSinDescargoInventarios();
            await busquedaComprobantes.cerrarBitacora();
        });
    });

    // ─── Boleta datos adicionales (Patrón C: Bitácora + Ver comprobante popup) ──
    test('Emitir boleta con datos adicionales @PV-1.10', async ({
                                                                    cajaPage, emisionPage, busquedaComprobantes,clientePage, page,
                                                                }) => {
        await test.step('Given: caja abierta y producto agregado', async () => {
            await cajaPage.continuarVendiendo();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
        });

        await test.step('When: abrir datos opcionales y llenarlos', async () => {
            await emisionPage.abrirDatosOpcionales();
            await emisionPage.llenarDatosOpcionales(CLIENTES.PERSONA_AUTO);
        });

        await test.step('And: emitir con efectivo', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('And: click Nueva Venta', async () => {
            await emisionPage.clickNuevaVenta();
        });

        // ─── Post-emisión: Búsqueda filtrada + Ver comprobante popup ───
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
            await busquedaComprobantes.clickAccionesExtra(popup);
            await busquedaComprobantes.clickDatosOpcionales(popup);
            await busquedaComprobantes.cerrarDrapePopup(popup);
        });
    });

    // ─── Precuenta (NO va a búsqueda) ─────────────────────────────────
    test('Visualizar precuenta de una boleta antes de emitir @PV-1.11', async ({
                                                                                   cajaPage,
                                                                                   comprobantePage,
                                                                                   emisionPage,
                                                                                   page,
                                                                               }) => {
        await test.step('Given: caja abierta, tipo BOLETA y producto agregado', async () => {
            await cajaPage.continuarVendiendo();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            await comprobantePage.seleccionarBoleta();
        });

        await test.step('When: abrir precuenta', async () => {
            await emisionPage.clickPrecuenta();
        });

        await test.step('Then: precuenta visible', async () => {
            await expect(page.getByRole('button', {name: 'PRECUENTA'})).toBeVisible();
        });
    });

    // ─── Vista previa (NO va a búsqueda) ──────────────────────────────
    test('Visualizar vista previa de una boleta antes de emitir @PV-1.12', async ({
                                                                                      cajaPage,
                                                                                      comprobantePage,
                                                                                      emisionPage,
                                                                                      page,
                                                                                  }) => {
        await test.step('Given: caja abierta, tipo BOLETA y producto agregado', async () => {
            await cajaPage.continuarVendiendo();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
            await comprobantePage.seleccionarBoleta();
        });

        await test.step('When: abrir vista previa', async () => {
            await page.getByRole('button', {name: 'VISTA PREVIA'}).click();
        });

        await test.step('Then: vista previa visible', async () => {
            // La vista previa abre un overlay con el comprobante
            await page.locator('.icon-close').click();
        });
    });

    // ─── Bloquear boleta con fecha fuera de rango (NO va a búsqueda) ──
    test('Bloquear emisión de boleta con fecha fuera del rango permitido @PV-1.13', async ({
                                                                                               cajaPage,
                                                                                               emisionPage,
                                                                                               page,
                                                                                           }) => {
        await test.step('Given: caja abierta y producto agregado', async () => {
            await cajaPage.continuarVendiendo();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
        });

        let fechaAntes = '';
        await test.step('And: capturar la fecha actual mostrada', async () => {
            fechaAntes = await emisionPage.obtenerFechaMostrada();
        });

        await test.step('When: intentar seleccionar una fecha con más de 4 días de antigüedad', async () => {
            await emisionPage.clickFechaFueraDeRango(4);
        });

        await test.step('Then: la fecha mostrada NO debe haber cambiado', async () => {
            const fechaDespues = await emisionPage.obtenerFechaMostrada();
            expect(fechaDespues).toBe(fechaAntes);
        });
    });
});
