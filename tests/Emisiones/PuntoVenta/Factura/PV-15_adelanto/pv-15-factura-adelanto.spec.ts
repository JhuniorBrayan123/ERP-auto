import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {esperarCargaOverlay} from "@utils/wait-helpers";

test.describe('PV-15 | Emitir comprobante con adelanto @PV-15', {tag: ['@punto-venta', '@factura', '@adelanto']}, () => {

    test('Emitir factura de adelanto @PV-15.2', async ({
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
            await page.locator('.slider').first().click(); 
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

    test('Emitir factura con adelanto aplicado @PV-15.3', async ({
                                                                     cajaPage,
                                                                     comprobantePage,
                                                                     emisionPage,
                                                                     emisionAdelantosPage,
                                                                     busquedaComprobantes,
                                                                     page,
                                                                 }) => {
        
        let emisionAdelanto: typeof emisionPage.ultimaEmision = null;

        await test.step('Given: crear factura de adelanto como precondición', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
            await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);

            await page.locator('.slider').first().click();
            await emisionPage.emitirConEfectivoExacto();
            emisionAdelanto = emisionPage.ultimaEmision;
            await emisionPage.clickNuevaVenta();
        });

        await test.step('And: iniciar nueva factura con cliente RUC', async () => {
            await comprobantePage.seleccionarFactura();
            const inputCliente = page.getByRole('textbox', {name: 'Buscar por nombre, razón'});
            await inputCliente.click();
            await inputCliente.fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
            await expect(page.getByText(CLIENTES.EMPRESA_RUC_AUTO.documento)).toBeVisible();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
            await emisionPage.incrementarCantidad(1)
        });

        await test.step('When: aplicar adelanto existente', async () => {
            await emisionAdelantosPage.abrirAdelantos(CLIENTES.EMPRESA_RUC_AUTO);
            
            await busquedaComprobantes.filtrarAdelantoFactura(emisionAdelanto);

            await page.locator('.v-modal > div').first().click();
        });

        await test.step('And: verificar total anticipos visible', async () => {
            await emisionPage.abrirTotales();
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
            await esperarCargaOverlay(popup)
            await busquedaComprobantes.validarAdelantosAplicadosEnPopup(popup);
        });
    });
});
