import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {CargarPedidoDesdeLista} from '@task/PuntoVenta/CargarPedidoDesdeLista.task';
import {DatosPedidoCargado} from '@question/PuntoVenta/DatosPedidoCargado.question';
import {BuscarYAgregarItemSimple} from '@task/PuntoVenta/BuscarYAgregarItemSimple.task';
import type {EmisionOutputRef} from '@task/PuntoVenta/RegistrarPedido.task';
import {RegistrarPedido} from '@task/PuntoVenta/RegistrarPedido.task';
import {SeleccionarTipoComprobante} from "@task/PuntoVenta/SeleccionarTipoComprobante.task";
import {SeleccionarCliente} from "@task/PuntoVenta/SeleccionarCliente.task";
import {ActualizarPedido} from "@task/PuntoVenta/ActualizarPedido.task";
import {AgregarItemAlCarrito} from "@task/PuntoVenta/AgregarItemAlCarrito.task";
import {ModalPostEmision} from '@question/PuntoVenta/ModalPostEmision.question';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';


test.describe('PV-20: Búsqueda y carga de pedidos', {tag: ['@punto-venta', '@pedido', '@busqueda']}, () => {
    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('P5: Cargar pedido emitido previamente @PV-20.12', async ({page}) => {
        const cajero = Cajero.con(page);

        // 1. Crear pedido y capturar correlativo vía API
        const pedido: EmisionOutputRef = {current: null};
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante('PEDIDO'),
            SeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido(pedido)
        );
        const correlativo = pedido.current?.correlativo ?? '';
        expect(correlativo).not.toBe('');
        await new PostEmisionPage(page).clickNuevaVenta();

        // 2. Buscar y cargar el pedido por su correlativo real
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante('PEDIDO'),
            CargarPedidoDesdeLista(correlativo)
        );

        expect(await cajero.pregunta(DatosPedidoCargado.contieneItem('item gravado sin control'))).toBe(true);
        expect(await cajero.pregunta(DatosPedidoCargado.contieneMontoItem('S/10.56'))).toBe(true);
    });

    test('P20: Actualizar pedido cargado @PV-20.13', async ({page}) => {
        const cajero = Cajero.con(page);

        // 1. Crear pedido y capturar correlativo vía API
        const pedido: EmisionOutputRef = {current: null};
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante('PEDIDO'),
            SeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido(pedido)
        );
        const correlativo = pedido.current?.correlativo ?? '';
        expect(correlativo).not.toBe('');
        await new PostEmisionPage(page).clickNuevaVenta();

        // 2. Cargar y actualizar
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante('PEDIDO'),
            CargarPedidoDesdeLista(correlativo),
            AgregarItemAlCarrito(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            ActualizarPedido()
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
    });
});
