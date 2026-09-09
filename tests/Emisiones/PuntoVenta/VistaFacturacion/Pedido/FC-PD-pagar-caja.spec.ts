import {expect, test} from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import {CrearPedidoVF} from '@screenplay/tasks/pedido/CrearPedidoVF';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {PagarPedido} from '@screenplay/interactions/pedido/PagarPedido';
import {IrABusquedaComprobantes} from '@task/PuntoVenta/IrABusquedaComprobantes.task';
import {FiltrarComprobantePorTipo} from '@task/PuntoVenta/FiltrarComprobantePorTipo.task';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';
import {PedidoTargets} from '@screenplay/targets/pedido/PedidoTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {esFacturadoSi} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {ValoresColumnaFacturado} from '@question/PuntoVenta/FacturadoColumna.question';

test.describe.serial('FC-PD-PAGAR-CAJA | Pagar Pedido en caja generando Boleta/Factura/NV', {
    tag: ['@facturacion', '@pedido', '@pago']
}, () => {
    let numeroPedido = '';
    const tiposComprobante = ['BOLETA', 'FACTURA', 'NOTA DE VENTA'] as const;

    test('Setup: Crear Pedido base para pagar en caja @FC-PD.PagarSetup', async ({vendedor}) => {
        const pedido = await vendedor.realizaYObtiene(
            CrearPedidoVF({
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
            })
        );
        numeroPedido = String(parseInt(pedido.correlativo, 10));
        expect(numeroPedido).toBeTruthy();
    });

    for (const tipo of tiposComprobante) {
        test(`Pagar Pedido cargado generando ${tipo} @FC-PD.Pagar${tipo.replace(/ /g, '')}`, async ({
                                                                                                       vendedor,
                                                                                                       page
                                                                                                   }) => {
            test.skip(!numeroPedido, 'No se generó el pedido base');

            const postEmisionPage = new PostEmisionPage(page);
            if (await postEmisionPage.estaVisible()) {
                await postEmisionPage.clickNuevaVenta();
            }

            
            
            
            
            await vendedor.realiza(SeleccionarTipoComprobante('PEDIDO'));

            const inputCorrelativo = PedidoTargets.inputCorrelativo(page);
            await inputCorrelativo.click();
            await inputCorrelativo.fill(numeroPedido);
            await PedidoTargets.btnBuscar(page).click();
            await esperarCargaOverlay(page).catch(() => {});

            const emision = await vendedor.realizaYObtiene(PagarPedido(tipo));

            if (tipo === 'BOLETA') expect(emision.serie).toMatch(/^B001/);
            if (tipo === 'FACTURA') expect(emision.serie).toMatch(/^F001/);
            if (tipo === 'NOTA DE VENTA') expect(emision.serie).toMatch(/^NV01/);

            expect(Number(emision.correlativo)).toBeGreaterThan(0);

            
            
            
            await vendedor.realiza(
                IrABusquedaComprobantes(),
                FiltrarComprobantePorTipo('PEDIDOS')
            );

            const valoresFacturado = await vendedor.pregunta(
                ValoresColumnaFacturado('PEDIDOS', numeroPedido)
            );
            expect(
                valoresFacturado.some(esFacturadoSi),
                `El pedido ${numeroPedido} debería mostrar Facturado="SI" tras generar ${tipo}. ` +
                `Valores encontrados: ${JSON.stringify(valoresFacturado)}`
            ).toBe(true);
        });
    }
});
