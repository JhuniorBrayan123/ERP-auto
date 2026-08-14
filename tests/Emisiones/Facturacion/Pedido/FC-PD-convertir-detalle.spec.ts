import {expect, test} from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import {CrearPedidoVF} from '@screenplay/tasks/pedido/CrearPedidoVF';
import {ConvertirComprobanteDesdeDetalle} from '@screenplay/interactions/facturacion/ConvertirComprobanteDesdeDetalle';
import {ClonarComprobanteDesdeDetalle} from '@task/PuntoVenta/busqueda-comprobantes/ClonarComprobanteDesdeDetalle';
import {IrABusquedaComprobantes} from '@task/PuntoVenta/IrABusquedaComprobantes.task';
import {FiltrarComprobantePorTipo} from '@task/PuntoVenta/FiltrarComprobantePorTipo.task';
import {CAJAS, CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {esFacturadoSi} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {ValoresColumnaFacturado} from '@question/PuntoVenta/FacturadoColumna.question';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';

test.describe.serial('FC-PD-CONVERTIR | Convertir/Clonar Pedido desde Ver Comprobante', {
    tag: ['@facturacion', '@pedido']
}, () => {
    let numeroPedido = '';
    const tiposComprobante = ['BOLETA', 'FACTURA', 'NOTA DE VENTA'] as const;

    test('Setup: Crear Pedido base para convertir desde detalle @FC-PD.ConvertirSetup', async ({vendedor}) => {
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
        test(`Convertir ${tipo} desde detalle @FC-PD.Convertir${tipo.replace(/ /g, '')}`, async ({vendedor, page}) => {
            test.skip(!numeroPedido, 'No se generó el pedido base');

            const postEmisionPage = new PostEmisionPage(page);
            if (await postEmisionPage.estaVisible()) {
                await postEmisionPage.clickNuevaVenta();
            }

            // Camino C: Ver Comprobante → "Convertir a" → tipo destino → pago → EmisionResult
            const emision = await vendedor.realizaYObtiene(
                ConvertirComprobanteDesdeDetalle(numeroPedido, 'PEDIDO', tipo)
            );

            if (tipo === 'BOLETA') expect(emision.serie).toMatch(/^B001/);
            if (tipo === 'FACTURA') expect(emision.serie).toMatch(/^F001/);
            if (tipo === 'NOTA DE VENTA') expect(emision.serie).toMatch(/^NV01/);

            expect(Number(emision.correlativo)).toBeGreaterThan(0);

            // Validación integrada: tras convertir el Pedido desde detalle, el
            // pedido origen DEBE mostrar Facturado = "SI"/"Sí" en Búsqueda de
            // Comprobantes. Si el producto muestra "No", el test FALLA y evidencia
            // el bug B001-631 (no se silencia ni se hace skip).
            await vendedor.realiza(
                IrABusquedaComprobantes(),
                FiltrarComprobantePorTipo('PEDIDOS')
            );

            const valoresFacturado = await vendedor.pregunta(
                ValoresColumnaFacturado('PEDIDOS', numeroPedido)
            );
            expect(
                valoresFacturado.some(esFacturadoSi),
                `El pedido ${numeroPedido} debería mostrar Facturado="SI" tras convertir a ${tipo} desde detalle. ` +
                `Valores encontrados: ${JSON.stringify(valoresFacturado)}`
            ).toBe(true);
        });
    }

    test('Clonar pedido desde detalle hacia caja VENTA @FC-PD.ClonarDetalle', async ({vendedor, page}) => {
        test.skip(!numeroPedido, 'No se generó el pedido base');

        const postEmisionPage = new PostEmisionPage(page);
        if (await postEmisionPage.estaVisible()) {
            await postEmisionPage.clickNuevaVenta();
        }

        // Clonar desde Ver Comprobante → caja VENTA → se abre venta con datos del origen
        const popupVenta = await vendedor.realizaYObtiene(
            ClonarComprobanteDesdeDetalle.haciaCaja(numeroPedido, 'PEDIDO', CAJAS.VENTA.nombre)
        );

        // Datos transferidos (patrón BC-21.1): cliente + item visibles en el popup de emisión
        await expect(popupVenta.getByRole('main')).toContainText(
            CLIENTES.EMPRESA_RUC_AUTO.nombre, {timeout: 30_000},
        );
        await expect(popupVenta.getByRole('main')).toContainText(
            ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre,
        );
        await popupVenta.close();
    });
});
