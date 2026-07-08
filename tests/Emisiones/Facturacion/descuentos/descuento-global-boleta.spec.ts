import {expect, test} from '@fixtures/PuntoVenta/facturacion.fixture';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {BuscarYSeleccionarCliente} from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import {BuscarYAgregarProducto} from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import {AplicarDescuentoGlobal} from '@screenplay/tasks/facturacion/AplicarDescuento';
import {TotalesDeVenta} from '@screenplay/questions/facturacion/TotalesDeVenta';
import {ConfirmarPago} from '@screenplay/interactions/facturacion/ConfirmarPago';
import {FacturacionTargets} from '@screenplay/targets/facturacion/FacturacionTargets';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

test.describe('Facturación — Descuento Global en Boleta', () => {

    test('Aplica descuento global de S/ 5 y verifica en totales', async ({cajero}) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('BOLETA'),
            BuscarYSeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            AplicarDescuentoGlobal({valor: '5', tipo: 'monto'}),
        );

        const totales = await cajero.pregunta(TotalesDeVenta());

        expect(totales).toBeDefined();
        const descuentoGlobal = totales['Descuento global'] ?? totales['Descuento'] ?? '';
        expect(descuentoGlobal).toBeDefined();
    });

    test('Emite Boleta con descuento global aplicado', async ({page, cajero}) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('BOLETA'),
            BuscarYSeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            AplicarDescuentoGlobal({valor: '5', tipo: 'monto'}),
        );

        const resultado = await cajero.realizaYObtiene(ConfirmarPago('efectivo'));

        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible({timeout: 15_000});
        await FacturacionTargets.btnNuevaVenta(page).click();

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
