import {test} from '@fixtures/PuntoVenta/facturacion.fixture';
import {EmitirComprobanteSimple} from '@screenplay/tasks/facturacion/EmitirComprobanteSimple';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

test.describe('FC-05 | Emitir Nota de Venta Simple', {tag: ['@facturacion', '@comprobantes']}, () => {

    test('SC-01: Emitir Nota de Venta con cliente DNI @FC-05.1', async ({page, cajero}) => {
        const resultado = await test.step('Given: emitir nota de venta con cliente DNI', async () => {
            return await cajero.realizaYObtiene(
                EmitirComprobanteSimple({
                    tipoComprobante: 'NOTA DE VENTA',
                    cliente: CLIENTES.PERSONA_DNI,
                    producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                    metodoPago: 'efectivo',
                })
            );
        });

        const busqueda = new BusquedaComprobantesPage(page);

        await test.step('Then: ir a Búsqueda de comprobantes y consultar SUNAT', async () => {
            await busqueda.navegarABusquedaComprobantesConSunat(resultado);
        });

        const estadoSunat = await test.step('And: validar estado SUNAT desde API de Consultas', async () => {
            return await busqueda.validarEstadoSunat();
        });

        await test.step('And: abrir bitácora y verificar emisión y descargo de inventarios', async () => {
            await busqueda.abrirBitacoraDelPrimerComprobante();
            await busqueda.validarComprobanteEmitido(estadoSunat);
            await busqueda.validarDescargoInventarios();
            await busqueda.cerrarBitacora();
        });
    });
});
