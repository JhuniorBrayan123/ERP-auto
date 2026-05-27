import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
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


test.describe('PV-20 Pedido - Lista de pedidos', {tag: ['@punto-venta', '@pedido', '@lista']}, () => {

    test('P11: Listar pedidos (Ver todos) @PV-20.7', async ({page}) => {
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
        expect(correlativo).not.toBe(''); // Fallamos rápido si no se capturó
        await cajero.intentaRealizar(ClickNuevaVenta());
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AbrirListaPedidos()
        );
        expect(await cajero.pregunta(MensajeVisible('Lista de Pedidos'))).toBe(true);
        const referenciaPedido = `PD01-${correlativo}`;
        expect(await cajero.pregunta(TarjetaPedidoVisible(referenciaPedido))).toBe(true);

        // 3. La tarjeta contiene los datos correctos (cliente y caja)
        expect(await cajero.pregunta(TarjetaPedidoContieneTexto(referenciaPedido, CLIENTES.EMPRESA_RUC_AUTO.nombre))).toBe(true);
        expect(await cajero.pregunta(TarjetaPedidoContieneTexto(referenciaPedido, CAJAS.AUTO.nombre))).toBe(true);

        // 4. La tarjeta tiene botón de opciones disponible
        expect(await cajero.pregunta(TarjetaPedidoTieneOpciones(referenciaPedido))).toBe(true);
    });

    test('P12: Buscar pedido por número en lista @PV-20.8', async ({page}) => {
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

    test('P13: Buscar pedido por cliente en lista @PV-20.9', async ({page}) => {
        const cajero = Cajero.con(page);
        const pedido: EmisionOutputRef = {current: null};

        // PRECONDICIÓN: creamos pedido con PERSONA_DNI (Jhunior)
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

        // ACCIÓN: ir a la lista y filtrar por PERSONA_DNI
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AbrirListaPedidos(),
            FiltrarListaPedidosPorCliente(CLIENTES.PERSONA_DNI)
        );

        // VALIDACIÓN POSITIVA: el card del pedido recién creado aparece
        const cardCreado = page.locator('.item-card')
            .filter({hasText: `PD01-${correlativoCreado}`}).first();
        await expect(cardCreado).toBeVisible({timeout: 10_000});
        // Y el nombre del cliente está dentro de ese card
        await expect(cardCreado).toContainText(CLIENTES.PERSONA_DNI.nombre);

        // VALIDACIÓN NEGATIVA: no aparecen cards del cliente que NO usamos
        // PERSONA_DNI_2 = MARCELO EDWIN SOLANO GARAY (nunca pedido en este test)
        const cardOtroCliente = page.locator('.item-card')
            .filter({hasText: CLIENTES.PERSONA_DNI_2.nombre});
        await expect(cardOtroCliente).toHaveCount(0);
    });

    test('P14: Buscar pedido por caja en lista @PV-20.10', async ({page}) => {
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

        // ACCIÓN: abrir lista (sin importar en qué caja estamos ahora) y filtrar
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AbrirListaPedidos(),
            FiltrarListaPedidosPorCaja(CAJAS.VENTA.nombre)
        );

        // VALIDACIÓN 1: el card del pedido que creamos en esa caja aparece
        const cardCreado = page.locator('.item-card')
            .filter({hasText: `PD01-${correlativoCreado}`}).first();
        await expect(cardCreado).toBeVisible({timeout: 10_000});

        // VALIDACIÓN 2: ese card muestra el nombre de la caja correcta
        await expect(cardCreado).toContainText(CAJAS.VENTA.nombre);

        // VALIDACIÓN NEGATIVA: no aparecen cards de la otra caja (caja-auto)
        const cardOtraCaja = page.locator('.item-card')
            .filter({hasText: CAJAS.AUTO.nombre});
        await expect(cardOtraCaja).toHaveCount(0);
    });

    test('P15: Ver pedido desde lista @PV-20.11', async ({page}) => {
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
        
        // El clic en "Ver pedido" abre un popup, así que capturamos la nueva pestaña
        const popup = await VerPedidoDesdeLista(correlativo)(page);
        
        // Validamos que el mensaje sea visible en el popup, no en la página original
        expect(await MensajeVisible(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre)(popup)).toBe(true);
    });
});
