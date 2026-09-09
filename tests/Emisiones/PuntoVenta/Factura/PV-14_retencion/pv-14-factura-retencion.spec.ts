import {test} from '@fixtures/PuntoVenta/validacion-fixture';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {esperarCargaOverlay} from '@utils/wait-helpers';

test.describe('PV-14 | Emitir comprobante con retención', {tag: ['@punto-venta', '@factura', '@retencion']}, () => {

    test('SC-01: Emitir factura con retención 18% @PV-14.1', async ({
                                                                 cajaPage,
                                                                 comprobantePage,
                                                                 emisionPage,
                                                                 emisionAdelantosPage,
                                                                 busquedaComprobantes,
                                                                 page,
                                                             }) => {
        await test.step('Given: FACTURA con cliente RUC', async () => {
            await cajaPage.continuarVendiendo();
            await comprobantePage.seleccionarFactura();
            await emisionPage.buscarItem(ITEMS_PV.ESTRICTO_GRAVADO_5.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.ESTRICTO_GRAVADO_5.nombre);
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, razón'}).fill(CLIENTES.EMPRESA_RUC_AUTO.documento);
            await page.getByText(CLIENTES.EMPRESA_RUC_AUTO.textoSelector).click();
        });

        await test.step('When: activar retención del 18%', async () => {
            await emisionAdelantosPage.activarRetencion('18');
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
            await esperarCargaOverlay(popup);
            await busquedaComprobantes.validarRetencionEnPopup(popup, '18');
        });
    });
});
