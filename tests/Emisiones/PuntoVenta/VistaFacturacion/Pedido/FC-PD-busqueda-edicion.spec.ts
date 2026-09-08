import {expect, test} from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import {CrearPedidoVF} from '@screenplay/tasks/pedido/CrearPedidoVF';
import {EditarPedidoVF} from '@screenplay/tasks/pedido/EditarPedidoVF';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {PedidoTargets} from '@screenplay/targets/pedido/PedidoTargets';
import {CAJAS, CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {FacturacionTargets} from '@screenplay/targets/facturacion/FacturacionTargets';
import {esperarCargaOverlaySiVisible} from '@utils/wait-helpers';
import {AbrirListaPedidos} from '@task/PuntoVenta/AbrirListaPedidos.task';
import {FiltrarListaPedidosPorNumero} from '@task/PuntoVenta/FiltrarListaPedidosPorNumero.task';
import {FiltrarListaPedidosPorCliente} from '@task/PuntoVenta/FiltrarListaPedidosPorCliente.task';
import {FiltrarListaPedidosPorCaja} from '@task/PuntoVenta/FiltrarListaPedidosPorCaja.task';
import {PedidoEnListaVisible} from '@question/PuntoVenta/PedidoEnListaVisible.question';
import {CargarPedidoDesdeLista} from '@task/PuntoVenta/CargarPedidoDesdeLista.task';
import {DatosPedidoCargado} from '@question/PuntoVenta/DatosPedidoCargado.question';
import {VerPedidoDesdeLista} from '@task/PuntoVenta/VerPedidoDesdeLista.task';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';

test.describe.serial('FC-PD-BUSQUEDA | Búsqueda y Edición de Pedido en Vista Facturación', {
    tag: ['@facturacion', '@pedido', '@busqueda']
}, () => {
    let pedidoBase = {numero: '', correlativo: ''};

    test('Setup: Crear Pedido base para pruebas de búsqueda', async ({vendedor}) => {
        const pedido = await vendedor.realizaYObtiene(
            CrearPedidoVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
            })
        );
        pedidoBase = pedido;
        expect(pedidoBase.numero).toBeTruthy();
    });

    test('SC-01: Buscar pedido existente por correlativo (Búsqueda Directa) @FC-PD.5', async ({vendedor, page}) => {
        test.skip(!pedidoBase.correlativo, 'No se generó el pedido base');
        await vendedor.realiza(
            SeleccionarTipoComprobante('PEDIDO')
        );

        await esperarCargaOverlaySiVisible(page).catch(() => {
        });
        const inputCorrelativo = PedidoTargets.inputCorrelativo(page);
        await inputCorrelativo.click();
        await inputCorrelativo.fill(pedidoBase.correlativo);
        await PedidoTargets.btnBuscar(page).click();
        await esperarCargaOverlaySiVisible(page).catch(() => {
        });

        await expect(page.locator('main')).toContainText(CLIENTES.PERSONA_DNI.nombre);
        await expect(page.locator('tbody')).toContainText(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
    });

    test('SC-02: Buscar pedido inexistente no hace nada o muestra error @FC-PD.7', async ({vendedor, page}) => {
        await vendedor.realiza(
            SeleccionarTipoComprobante('PEDIDO')
        );
        await esperarCargaOverlaySiVisible(page).catch(() => {
        });
        const inputCorrelativo = PedidoTargets.inputCorrelativo(page);
        await inputCorrelativo.click();
        await inputCorrelativo.fill('99999999');
        await PedidoTargets.btnBuscar(page).click();
        await esperarCargaOverlaySiVisible(page);
        await expect(
            page.getByText('No se encontró el comprobante con los datos ingresados. Por favor, verifica e intenta nuevamente.')
        ).toBeVisible();

        await expect(FacturacionTargets.inputBuscarCliente(page)).toBeVisible();
        await expect(FacturacionTargets.inputBuscarCliente(page)).toBeEmpty();
    });

    test('SC-03: Listar y filtrar pedido desde la opción Ver Todos (Número) @FC-PD.Listar', async ({vendedor}) => {
        test.skip(!pedidoBase.correlativo, 'No se generó el pedido base');
        const soloCorrelativo = String(parseInt(pedidoBase.correlativo, 10));
        await vendedor.realiza(
            SeleccionarTipoComprobante('PEDIDO'),
            AbrirListaPedidos("facturacion"),
            FiltrarListaPedidosPorNumero(soloCorrelativo)
        );

        expect(await vendedor.pregunta(PedidoEnListaVisible(soloCorrelativo))).toBe(true);
    });

    test('SC-04: Filtrar pedido por cliente en lista @FC-PD.FiltroCliente', async ({vendedor}) => {
        test.skip(!pedidoBase.correlativo, 'No se generó el pedido base');
        await vendedor.realiza(
            SeleccionarTipoComprobante('PEDIDO'),
            AbrirListaPedidos("facturacion"),
            FiltrarListaPedidosPorCliente(CLIENTES.PERSONA_DNI)
        );

        expect(await vendedor.pregunta(PedidoEnListaVisible(pedidoBase.correlativo))).toBe(true);
    });

    test('SC-04.5: Filtrar pedido por caja en lista @FC-PD.FiltroCaja', async ({vendedor}) => {
        test.skip(!pedidoBase.correlativo, 'No se generó el pedido base');
        await vendedor.realiza(
            SeleccionarTipoComprobante('PEDIDO'),
            AbrirListaPedidos("facturacion"),
            FiltrarListaPedidosPorCaja(CAJAS.VENTA.nombre)
        );

        expect(await vendedor.pregunta(PedidoEnListaVisible(pedidoBase.correlativo))).toBe(true);
    });

    test('SC-05: Cargar pedido desde la lista @FC-PD.Cargar', async ({vendedor}) => {
        test.skip(!pedidoBase.correlativo, 'No se generó el pedido base');
        const soloCorrelativo = String(parseInt(pedidoBase.correlativo, 10));
        await vendedor.realiza(
            SeleccionarTipoComprobante('PEDIDO'),
            AbrirListaPedidos("facturacion"),
            CargarPedidoDesdeLista(soloCorrelativo)
        );

        expect(await vendedor.pregunta(DatosPedidoCargado.contieneItemEnVF(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre))).toBe(true);
    });

    test('SC-06: Ver pedido desde la lista de pedidos @FC-PD.Ver', async ({vendedor}) => {
        test.skip(!pedidoBase.correlativo, 'No se generó el pedido base');
        const soloCorrelativo = String(parseInt(pedidoBase.correlativo, 10));
        await vendedor.realiza(
            SeleccionarTipoComprobante('PEDIDO'),
            AbrirListaPedidos("facturacion")
        );

        const popup = await vendedor.realizaYObtiene(VerPedidoDesdeLista(soloCorrelativo));
        await expect(popup.getByText(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre).first()).toBeVisible({timeout: 30_000});
    });

    test('SC-07: Editar y actualizar pedido cargado @FC-PD.6', async ({vendedor, page}) => {
        test.skip(!pedidoBase.correlativo, 'No se generó el pedido base');
        const pedido = await vendedor.realizaYObtiene(
            CrearPedidoVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
            })
        );
        const postEmisionPage = new PostEmisionPage(page);
        if (await postEmisionPage.estaVisible()) {
            await postEmisionPage.clickNuevaVenta();
        }

        await vendedor.realiza(
            SeleccionarTipoComprobante('PEDIDO'),
            EditarPedidoVF({
                correlativo: pedido.correlativo,
                nuevosItems: [ITEMS_PV.PRODUCTO_SIMPLE]
            })
        );
        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible();
    });
});
