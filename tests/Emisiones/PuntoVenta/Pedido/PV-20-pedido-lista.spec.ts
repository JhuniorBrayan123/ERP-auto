import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {TIPOS_COMPROBANTE, ITEMS_PV, CLIENTES, CAJAS} from '@helpers/PuntoVenta/emision-data.helper';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {SeleccionarTipoComprobante} from '@task/PuntoVenta/SeleccionarTipoComprobante.task';
import {SeleccionarCliente} from '@task/PuntoVenta/SeleccionarCliente.task';
import {BuscarYAgregarItemSimple} from '@task/PuntoVenta/BuscarYAgregarItemSimple.task';
import {RegistrarPedido} from '@task/PuntoVenta/RegistrarPedido.task';
import type {EmisionOutputRef} from '@task/PuntoVenta/RegistrarPedido.task';
import {AbrirListaPedidos} from '@task/PuntoVenta/AbrirListaPedidos.task';
import {FiltrarListaPedidosPorNumero} from '@task/PuntoVenta/FiltrarListaPedidosPorNumero.task';
import {FiltrarListaPedidosPorCliente} from '@task/PuntoVenta/FiltrarListaPedidosPorCliente.task';
import {FiltrarListaPedidosPorCaja} from '@task/PuntoVenta/FiltrarListaPedidosPorCaja.task';
import {VerPedidoDesdeLista} from '@task/PuntoVenta/VerPedidoDesdeLista.task';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {PedidoEnListaVisible} from '@question/PuntoVenta/PedidoEnListaVisible.question';
import {GrillaContiene} from '@question/PuntoVenta/GrillaContiene.question';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';


test.describe('PV-20 Pedido - Lista de pedidos', () => {

    test('P11: Listar pedidos (Ver todos)', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IniciarVentaEnCaja(CAJAS.AUTO.nombre),
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AbrirListaPedidos()
        );
        expect(await cajero.pregunta(MensajeVisible('Lista de Pedidos'))).toBe(true);
        // Validar que hay al menos un registro cambiando los filtros
        await page.getByText('Cliente', { exact: true }).click();
        await page.getByText('N° de pedido').click();
    });

    test('P12: Buscar pedido por número en lista', async ({page}) => {
        const cajero = Cajero.con(page);
        const pedido: EmisionOutputRef = { current: null };
        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido(pedido)
        );
        const correlativo = pedido.current?.correlativo ?? '';
        expect(correlativo).not.toBe('');
        await new PostEmisionPage(page).clickNuevaVenta();

        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AbrirListaPedidos(),
            FiltrarListaPedidosPorNumero(correlativo)
        );
        expect(await cajero.pregunta(PedidoEnListaVisible(correlativo))).toBe(true);
    });

    test('P13: Buscar pedido por cliente en lista', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            SeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido()
        );
        const postEmision = new PostEmisionPage(page);
        await postEmision.clickNuevaVenta();

        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AbrirListaPedidos(),
            FiltrarListaPedidosPorCliente(CLIENTES.PERSONA_DNI)
        );
        expect(await cajero.pregunta(GrillaContiene(CLIENTES.PERSONA_DNI.nombre))).toBe(true);
    });

    test('P14: Buscar pedido por caja en lista', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IniciarVentaEnCaja(CAJAS.VENTA.nombre),
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido()
        );
        const postEmision = new PostEmisionPage(page);
        await postEmision.clickNuevaVenta();

        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AbrirListaPedidos(),
            FiltrarListaPedidosPorCaja(CAJAS.VENTA.nombre)
        );
        expect(await cajero.pregunta(GrillaContiene(CAJAS.VENTA.nombre))).toBe(true);
    });

    test('P15: Ver pedido desde lista', async ({page}) => {
        const cajero = Cajero.con(page);
        const pedido: EmisionOutputRef = { current: null };
        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido(pedido)
        );
        const correlativo = pedido.current?.correlativo ?? '';
        expect(correlativo).not.toBe('');
        await new PostEmisionPage(page).clickNuevaVenta();

        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AbrirListaPedidos(),
            VerPedidoDesdeLista(correlativo)
        );
        expect(await cajero.pregunta(MensajeVisible(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre))).toBe(true);
    });
});
