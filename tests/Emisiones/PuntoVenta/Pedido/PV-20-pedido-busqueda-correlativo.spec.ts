import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {TIPOS_COMPROBANTE, ITEMS_PV, CLIENTES} from '@helpers/PuntoVenta/emision-data.helper';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {SeleccionarTipoComprobante} from '@task/PuntoVenta/SeleccionarTipoComprobante.task';
import {SeleccionarCliente} from '@task/PuntoVenta/SeleccionarCliente.task';
import {BuscarYAgregarItemSimple} from '@task/PuntoVenta/BuscarYAgregarItemSimple.task';
import {RegistrarPedido} from '@task/PuntoVenta/RegistrarPedido.task';
import type {EmisionOutputRef} from '@task/PuntoVenta/RegistrarPedido.task';
import {BuscarPedidoPorCorrelativo} from '@task/PuntoVenta/BuscarPedidoPorCorrelativo.task';
import {BotonesPedidoCargadoVisibles} from '@question/PuntoVenta/BotonesPedidoCargadoVisibles.question';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';


test.describe('PV-20 Pedido - Búsqueda por correlativo', () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('P10: Buscar pedido por correlativo', async ({page}) => {
        const cajero = Cajero.con(page);
        
        // 1. Create a pedido to have a valid correlativo — capturamos por API
        const pedido: EmisionOutputRef = { current: null };
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            SeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido(pedido)
        );
        
        const correlativo = pedido.current?.correlativo ?? '';
        expect(correlativo).not.toBe('');
        await new PostEmisionPage(page).clickNuevaVenta();

        // 2. Search it
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            BuscarPedidoPorCorrelativo(correlativo)
        );

        // 3. Validations
        expect(await cajero.pregunta(BotonesPedidoCargadoVisibles())).toBe(true);
        expect(await cajero.pregunta(MensajeVisible(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre))).toBe(true);
    });
});
