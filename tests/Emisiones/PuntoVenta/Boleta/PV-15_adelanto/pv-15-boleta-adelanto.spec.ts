import {expect, test} from '@fixtures/PuntoVenta/validacion-fixture';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-15 | Emitir comprobante con adelanto @PV-15', {tag: ['@punto-venta', '@boleta', '@adelanto']}, () => {

    test('Emitir boleta de adelanto @PV-15.1', async ({
                                                         cajaPage, emisionPage, busquedaComprobantes, emisionAdelantosPage,
                                                     }) => {
        await test.step('Given: caja abierta y producto agregado', async () => {
            await cajaPage.continuarVendiendo();
            await emisionPage.buscarItem(ITEMS_PV.PRODUCTO_GRAVADO.codigo);
            await emisionPage.seleccionarItem(ITEMS_PV.PRODUCTO_GRAVADO.nombre);
        });

        await test.step('When: activar switch adelanto', async () => {
            await emisionAdelantosPage.activarDocAdelanto();
        });

        await test.step('And: emitir con efectivo', async () => {
            await emisionPage.emitirConEfectivoExacto();
        });

        await test.step('And: click Nueva Venta', async () => {
            await emisionPage.clickNuevaVenta();
        });

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
});
