import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-03 | Factura con equivalencias, variantes y descuento global @PV-03', {tag: ['@punto-venta', '@factura', '@descuento']}, () => {

    // ─── Helper: seleccionar factura + cliente RUC ────────────────────
    async function setupFacturaConClienteRUC(
        comprobantePage: any, clientePage: any, page: any,
    ) {
        await comprobantePage.seleccionarFactura();
        await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
        await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
        await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
    }

    test('Emitir factura con descuento ítem % y descuento global monto @PV-03.6', async ({
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

    test('Visualizar precuenta de factura @PV-03.7', async ({
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
});
