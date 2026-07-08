import {expect, test} from '@fixtures/PuntoVenta/facturacion.fixture';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {BuscarYSeleccionarCliente} from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import {BuscarYAgregarProducto} from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import {ConfirmarPago} from '@screenplay/interactions/facturacion/ConfirmarPago';
import {AplicarDescuentoItem} from '@screenplay/tasks/facturacion/AplicarDescuento';
import {FacturacionTargets} from '@screenplay/targets/facturacion/FacturacionTargets';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

test.describe('Facturación — Descuento por ítem en Factura', () => {

    test('Emite factura con descuento por ítem desde Vista Facturación', async ({page, cajero}) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYSeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            AplicarDescuentoItem({indiceItem: 0, valor: '50', tipo: 'monto'}),
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
