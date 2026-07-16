import {expect, test} from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import {CrearPedidoVF} from '@screenplay/tasks/pedido/CrearPedidoVF';
import {IrABusquedaComprobantes} from '@task/PuntoVenta/IrABusquedaComprobantes.task';
import {FiltrarComprobantePorTipo} from '@task/PuntoVenta/FiltrarComprobantePorTipo.task';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {GenerarComprobanteDesdeBusqueda} from '@screenplay/interactions/facturacion/GenerarComprobanteDesdeBusqueda';

test.describe.serial('FC-PD-GENERAR | Generar Comprobantes desde Pedido', {
    tag: ['@facturacion', '@pedido', '@generar']
}, () => {
    let numeroPedidoBase = '';

    test('Setup: Crear Pedido base para generación @FC-PD.8-Setup', async ({vendedor}) => {
        const pedido = await vendedor.realizaYObtiene(
            CrearPedidoVF({
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
            })
        );
        numeroPedidoBase = String(parseInt(pedido.correlativo, 10));
        expect(numeroPedidoBase).toBeTruthy();
    });

    const tiposComprobante = ['BOLETA', 'FACTURA', 'NOTA DE VENTA'] as const;

    for (const tipo of tiposComprobante) {
        test(`PD.18-20: Generar ${tipo} desde Pedido registrado @FC-PD.8-${tipo.replace(/ /g, '')}`, async ({
                                                                                                                vendedor,
                                                                                                                page
                                                                                                            }) => {
            test.skip(!numeroPedidoBase, 'No se generó el pedido base');

            await vendedor.realiza(
                IrABusquedaComprobantes(),
                FiltrarComprobantePorTipo('PEDIDOS')
            );

            const emision = await vendedor.realizaYObtiene(
                GenerarComprobanteDesdeBusqueda(numeroPedidoBase, tipo)
            );

            if (tipo === 'BOLETA') {
                expect(emision.serie).toMatch(/^B/);
            } else if (tipo === 'FACTURA') {
                expect(emision.serie).toMatch(/^F/);
            } else if (tipo === 'NOTA DE VENTA') {
                expect(emision.serie).toMatch(/^NV/);
            }
        });
    }
});
