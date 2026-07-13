import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {SeleccionarTipoComprobante} from '@task/PuntoVenta/SeleccionarTipoComprobante.task';
import {SeleccionarCliente} from '@task/PuntoVenta/SeleccionarCliente.task';
import {SeleccionarClienteSinDoc} from '@task/PuntoVenta/SeleccionarClienteSinDoc.task';
import {AgregarItemAlCarrito} from '@task/PuntoVenta/AgregarItemAlCarrito.task';
import {RegistrarPedido} from '@task/PuntoVenta/RegistrarPedido.task';
import {ModalPostEmision} from '@question/PuntoVenta/ModalPostEmision.question';
import {BitacoraComprobante} from '@question/PuntoVenta/BitacoraComprobante.question';
import {CLIENTES, ITEMS_PV, TIPOS_COMPROBANTE} from '@helpers/PuntoVenta/emision-data.helper';
import {EmisionResult} from "@app-types/emision.types";

test.describe('PV-20 | Registro de Pedido Básico', {tag: ['@punto-venta', '@pedido', '@emision']}, () => {
    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-01: Registrar pedido con cliente @PV-20.1', async ({page}) => {
        const cajero = Cajero.con(page);
        const resultadoPedido = {current: null as EmisionResult | null};
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            SeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIMPLE),
            RegistrarPedido(resultadoPedido)
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        expect(await cajero.pregunta(ModalPostEmision.tieneCorrelativo())).toBe(true);
        expect(await cajero.pregunta(BitacoraComprobante.noMuestraDescargoInventario(resultadoPedido))).toBe(true);
    });

    test('SC-02: Pedido no afecta stock físico @PV-20.2', async ({page}) => {
        const cajero = Cajero.con(page);
        const resultadoPedido = {current: null as EmisionResult | null};
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIMPLE),
            RegistrarPedido(resultadoPedido)
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        expect(await cajero.pregunta(BitacoraComprobante.noMuestraDescargoInventario(resultadoPedido))).toBe(true);
    });

    test('SC-03: Registrar pedido con cliente sin documento @PV-20.3', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            SeleccionarClienteSinDoc(CLIENTES.CLIENTE_SIN_DOC),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIMPLE),
            RegistrarPedido()
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        expect(await cajero.pregunta(ModalPostEmision.tieneCorrelativo())).toBe(true);
    });

    test('SC-04: Registrar pedido con productos sin stock @PV-20.4', async ({page}) => {
        const cajero = Cajero.con(page);
        const resultadoPedido = {current: null as EmisionResult | null};
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            SeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIN_STOCK),
            RegistrarPedido(resultadoPedido)
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        expect(await cajero.pregunta(BitacoraComprobante.noMuestraDescargoInventario(resultadoPedido))).toBe(true);
    });
});
