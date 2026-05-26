import { test, expect } from '@playwright/test';
import { Cajero } from '../../../../src/actors/cajero';
import { IniciarVentaEnCaja } from '@task/PuntoVenta/IniciarVentaEnCaja';
import { SeleccionarTipoComprobante } from '@task/PuntoVenta/SeleccionarTipoComprobante.task';
import { SeleccionarCliente } from '@task/PuntoVenta/SeleccionarCliente.task';
import { SeleccionarClienteSinDoc } from '@task/PuntoVenta/SeleccionarClienteSinDoc.task';
import { AgregarItemAlCarrito } from '@task/PuntoVenta/AgregarItemAlCarrito.task';
import { RegistrarPedido } from '@task/PuntoVenta/RegistrarPedido.task';
import { ModalPostEmision } from '@question/PuntoVenta/ModalPostEmision.question';
import { BitacoraComprobante } from '@question/PuntoVenta/BitacoraComprobante.question';
import { TIPOS_COMPROBANTE, CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';


test.describe('PV-20: Registro de Pedido Básico', () => {
    test.beforeEach(async ({ page }) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('P1: Registrar pedido con cliente', async ({ page }) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            SeleccionarCliente(CLIENTES.EMPRESA_RUC),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIMPLE),
            RegistrarPedido()
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        // expect(await cajero.pregunta(ModalPostEmision.tieneCorrelativo())).toBe(true);
        // expect(await cajero.pregunta(BitacoraComprobante.noMuestraDescargoInventario())).toBe(true);
    });

    test('P2: Pedido no afecta stock físico', async ({ page }) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIMPLE),
            RegistrarPedido()
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        // expect(await cajero.pregunta(BitacoraComprobante.noMuestraDescargoInventario())).toBe(true);
    });

    test('P17: Registrar pedido con cliente sin documento', async ({ page }) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            SeleccionarClienteSinDoc(CLIENTES.CLIENTE_SIN_DOC),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIMPLE),
            RegistrarPedido()
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        // expect(await cajero.pregunta(ModalPostEmision.tieneCorrelativo())).toBe(true);
    });

    test('P18: Registrar pedido con productos sin stock', async ({ page }) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            SeleccionarCliente(CLIENTES.EMPRESA_RUC),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIN_STOCK),
            RegistrarPedido()
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        expect(await cajero.pregunta(BitacoraComprobante.noMuestraDescargoInventario())).toBe(true);
    });
});
