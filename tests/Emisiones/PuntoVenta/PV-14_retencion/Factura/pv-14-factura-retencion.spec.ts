import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-14 | Emitir comprobante con retención @PV-14', {tag: ['@punto-venta', '@factura', '@retencion']}, () => {

    test('Emitir factura con retención 18% @PV-14.1', async ({
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
});
