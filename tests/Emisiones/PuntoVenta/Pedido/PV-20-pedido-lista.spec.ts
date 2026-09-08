import {expect, test} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {CAJAS, CLIENTES, ITEMS_PV, TIPOS_COMPROBANTE} from '@helpers/PuntoVenta/emision-data.helper';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {SeleccionarTipoComprobante} from '@task/PuntoVenta/SeleccionarTipoComprobante.task';
import {SeleccionarCliente} from '@task/PuntoVenta/SeleccionarCliente.task';
import {BuscarYAgregarItemSimple} from '@task/PuntoVenta/BuscarYAgregarItemSimple.task';
import type {EmisionOutputRef} from '@task/PuntoVenta/RegistrarPedido.task';
import {RegistrarPedido} from '@task/PuntoVenta/RegistrarPedido.task';
import {AbrirListaPedidos} from '@task/PuntoVenta/AbrirListaPedidos.task';
import {FiltrarListaPedidosPorNumero} from '@task/PuntoVenta/FiltrarListaPedidosPorNumero.task';
import {FiltrarListaPedidosPorCliente} from '@task/PuntoVenta/FiltrarListaPedidosPorCliente.task';
import {FiltrarListaPedidosPorCaja} from '@task/PuntoVenta/FiltrarListaPedidosPorCaja.task';
import {VerPedidoDesdeLista} from '@task/PuntoVenta/VerPedidoDesdeLista.task';
import {ClickNuevaVenta} from '@interactions/PuntoVenta/ClickNuevaVenta';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {PedidoEnListaVisible} from '@question/PuntoVenta/PedidoEnListaVisible.question';
import {TarjetaPedidoVisible} from '@question/PuntoVenta/TarjetaPedidoVisible.question';
import {TarjetaPedidoContieneTexto} from '@question/PuntoVenta/TarjetaPedidoContieneTexto.question';
import {TarjetaPedidoTieneOpciones} from '@question/PuntoVenta/TarjetaPedidoTieneOpciones.question';
import {esperarCargaOverlaySiVisible} from "@utils/wait-helpers";

test.describe('PV-20 | Lista de pedidos', {tag: ['@punto-venta', '@pedido', '@lista']}, () => {

    test('SC-01: Listar pedidos (Ver todos) @PV-20.1', async ({page}) => {
        const cajero = Cajero.con(page);
        const pedido: EmisionOutputRef = {current: null};
        await cajero.intentaRealizar(
            IniciarVentaEnCaja(CAJAS.AUTO.nombre),
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            SeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido(pedido)
        );
        const correlativo = pedido.current?.correlativo ?? '';
        expect(correlativo).not.toBe('');
        await cajero.intentaRealizar(ClickNuevaVenta());
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AbrirListaPedidos()
        );
        expect(await cajero.pregunta(MensajeVisible('Lista de Pedidos'))).toBe(true);
        const referenciaPedido = `PD01-${correlativo}`;
        expect(await cajero.pregunta(TarjetaPedidoVisible(referenciaPedido))).toBe(true);

        expect(await cajero.pregunta(TarjetaPedidoContieneTexto(referenciaPedido, CLIENTES.EMPRESA_RUC_AUTO.nombre))).toBe(true);
        expect(await cajero.pregunta(TarjetaPedidoContieneTexto(referenciaPedido, CAJAS.AUTO.nombre))).toBe(true);

        expect(await cajero.pregunta(TarjetaPedidoTieneOpciones(referenciaPedido))).toBe(true);
    });

    test('SC-02: Buscar pedido por número en lista @PV-20.2', async ({page}) => {
        const cajero = Cajero.con(page);
        const pedido: EmisionOutputRef = {current: null};
        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido(pedido)
        );
        const correlativo = pedido.current?.correlativo ?? '';
        expect(correlativo).not.toBe('');
        await cajero.intentaRealizar(ClickNuevaVenta());

        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AbrirListaPedidos(),
            FiltrarListaPedidosPorNumero(correlativo)
        );
        expect(await cajero.pregunta(PedidoEnListaVisible(correlativo))).toBe(true);
    });

    test('SC-03: Buscar pedido por cliente en lista @PV-20.3', async ({page}) => {
        const cajero = Cajero.con(page);
        const pedido: EmisionOutputRef = {current: null};

        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            SeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido(pedido)
        );
        const correlativoCreado = pedido.current?.correlativo ?? '';
        expect(correlativoCreado).not.toBe('');
        await cajero.intentaRealizar(ClickNuevaVenta());

        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AbrirListaPedidos(),
            FiltrarListaPedidosPorCliente(CLIENTES.PERSONA_DNI)
        );

        const cardCreado = page.locator('.item-card')
            .filter({hasText: `PD01-${correlativoCreado}`}).first();
        await expect(cardCreado).toBeVisible({timeout: 10_000});

        await expect(cardCreado).toContainText(CLIENTES.PERSONA_DNI.nombre);

        const cardOtroCliente = page.locator('.item-card')
            .filter({hasText: CLIENTES.PERSONA_DNI_2.nombre});
        await expect(cardOtroCliente).toHaveCount(0);
    });

    test('SC-04: Buscar pedido por caja en lista @PV-20.4', async ({page}) => {
        const cajero = Cajero.con(page);
        const pedido: EmisionOutputRef = {current: null};
        await cajero.intentaRealizar(
            IniciarVentaEnCaja(CAJAS.VENTA.nombre),
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido(pedido)
        );
        const correlativoCreado = pedido.current?.correlativo ?? '';
        expect(correlativoCreado).not.toBe('');
        await cajero.intentaRealizar(ClickNuevaVenta());

        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AbrirListaPedidos(),
            FiltrarListaPedidosPorCaja(CAJAS.VENTA.nombre)
        );

        const cardCreado = page.locator('.item-card')
            .filter({hasText: `PD01-${correlativoCreado}`}).first();
        await expect(cardCreado).toBeVisible({timeout: 10_000});

        await expect(cardCreado).toContainText(CAJAS.VENTA.nombre);

        const cardOtraCaja = page.locator('.item-card')
            .filter({hasText: CAJAS.AUTO.nombre});
        await expect(cardOtraCaja).toHaveCount(0);
    });

    test('SC-05: Ver pedido desde lista @PV-20.5', async ({page}) => {
        const cajero = Cajero.con(page);
        const pedido: EmisionOutputRef = {current: null};
        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido(pedido)
        );
        const correlativo = pedido.current?.correlativo ?? '';
        expect(correlativo).not.toBe('');
        await cajero.intentaRealizar(ClickNuevaVenta());

        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AbrirListaPedidos()
        );

        const popup = await VerPedidoDesdeLista(correlativo)(page);
        await esperarCargaOverlaySiVisible(popup)
        await expect(popup.getByText(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre).first()).toBeVisible({timeout: 30_000});
    });
});
