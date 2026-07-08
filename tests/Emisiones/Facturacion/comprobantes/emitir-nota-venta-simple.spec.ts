import {test} from '@fixtures/PuntoVenta/facturacion.fixture';
import {EmitirComprobanteSimple} from '@screenplay/tasks/facturacion/EmitirComprobanteSimple';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

test.describe('Facturación — Emitir Nota de Venta Simple', () => {

    test('Emite una Nota de Venta con cliente DNI', async ({page, cajero}) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirComprobanteSimple({
                tipoComprobante: 'NOTA DE VENTA',
                cliente: CLIENTES.PERSONA_DNI,
                producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                metodoPago: 'efectivo',
            })
        );
        const busqueda = new BusquedaComprobantesPage(page);
        const estadoSunat = await test.step('And: validar estado SUNAT desde API de Consultas', async () => {
            return await busqueda.validarEstadoSunat();
        });

        await busqueda.navegarABusquedaComprobantes(resultado);
        await busqueda.abrirBitacoraDelPrimerComprobante();
        await busqueda.validarComprobanteEmitido(estadoSunat);
        await busqueda.validarDescargoInventarios();
        await busqueda.cerrarBitacora();
    });
});
