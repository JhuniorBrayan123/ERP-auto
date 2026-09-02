import {test} from '@fixtures/PuntoVenta/facturacion.fixture';
import {EmitirComprobanteSimple} from '@screenplay/tasks/facturacion/EmitirComprobanteSimple';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

test.describe('FC-02 | Emitir Boleta Simple', {tag: ['@facturacion', '@comprobantes']}, () => {

    test('SC-01: Emitir Boleta con cliente DNI y pago en efectivo @FC-02.1', async ({page, cajero}) => {
        const resultado = await test.step('Given: emitir boleta con cliente DNI y pago en efectivo', async () => {
            return await cajero.realizaYObtiene(
                EmitirComprobanteSimple({
                    tipoComprobante: 'BOLETA',
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

    test('SC-02: Emitir Boleta con Consumidor Final (doc 00000000) — sin seleccionar cliente @FC-02.2', async ({page, cajero}) => {
        const resultado = await test.step('Given: emitir boleta sin cliente (Consumidor Final)', async () => {
            return await cajero.realizaYObtiene(
                EmitirComprobanteSimple({
                    tipoComprobante: 'BOLETA',
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
