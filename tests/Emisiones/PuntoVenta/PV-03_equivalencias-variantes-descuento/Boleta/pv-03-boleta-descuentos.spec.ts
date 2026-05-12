import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-03 | Boleta con equivalencias, variantes y descuento global @PV-03', {tag: ['@punto-venta', '@boleta', '@descuento']}, () => {

    // ─── Boleta descuento ítem monto (Patrón A: Bitácora) ─────────────
    test('Emitir boleta con descuento por ítem por monto @PV-03.1', async ({
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
    test('Emitir boleta con descuento global por porcentaje @PV-03.2', async ({
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
    test('Emitir boleta con descuento ítem porcentaje + descuento global @PV-03.3', async ({
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
    test('Emitir boleta con ítem con equivalencia @PV-03.4', async ({
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

    // ─── Precuenta (NO va a búsqueda) ─────────────────────────────────
    test('Visualizar precuenta de una boleta antes de emitir @PV-03.5', async ({
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
});
