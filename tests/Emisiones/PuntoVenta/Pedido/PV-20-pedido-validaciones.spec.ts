import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {TIPOS_COMPROBANTE, CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {SeleccionarTipoComprobante} from '@task/PuntoVenta/SeleccionarTipoComprobante.task';
import {SeleccionarCliente} from '@task/PuntoVenta/SeleccionarCliente.task';
import {BuscarYAgregarItemSimple} from '@task/PuntoVenta/BuscarYAgregarItemSimple.task';
import {RegistrarPedido} from '@task/PuntoVenta/RegistrarPedido.task';
import {IntentarDescargarXml} from '@task/PuntoVenta/IntentarDescargarXml.task';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {IrABusquedaComprobantes} from '@task/PuntoVenta/IrABusquedaComprobantes.task';
import {FiltrarComprobantePorTipo} from '@task/PuntoVenta/FiltrarComprobantePorTipo.task';
import {AbrirBitacoraComprobante} from '@task/PuntoVenta/AbrirBitacoraComprobante.task';
import {BitacoraContiene} from '@question/PuntoVenta/BitacoraContiene.question';
import {ModalPostEmision} from '@question/PuntoVenta/ModalPostEmision.question';
import {AccionesPostEmisionCompletas} from '@question/PuntoVenta/AccionesPostEmisionCompletas.question';

test.describe('PV-20 Pedido - Validaciones', {tag: ['@punto-venta', '@pedido', '@validaciones']}, () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('P5: Validar que pedido no genera comprobante electrónico @PV-20.5', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            SeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido()
        );
        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        expect(await cajero.pregunta(ModalPostEmision.tieneCorrelativo())).toBe(true);

        const textoCompleto = await page.locator('.v-dialog--active').innerText().catch(() => '');
        const match = textoCompleto.match(/(PD01)-\d+/);
        const correlativo = match ? match[0].split('-')[1] : '';

        await cajero.intentaRealizar(IntentarDescargarXml());
        expect(await cajero.pregunta(MensajeVisible('Este tipo de comprobante no genera XML'))).toBe(true);

        if(correlativo) {
            await cajero.intentaRealizar(
                IrABusquedaComprobantes(),
                FiltrarComprobantePorTipo('PEDIDOS'),
                AbrirBitacoraComprobante(correlativo)
            );
            expect(await cajero.pregunta(BitacoraContiene('Comprobante Registrado'))).toBe(true);
            expect(await cajero.pregunta(BitacoraContiene('Comprobante Emitido'))).toBe(true);
        }
    });

    test('P6: Validar acciones disponibles post-registro @PV-20.6', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.PEDIDO),
            SeleccionarCliente(CLIENTES.PERSONA_DNI),
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarPedido()
        );
        expect(await cajero.pregunta(MensajeVisible('¡Buen trabajo!'))).toBe(true);
        expect(await cajero.pregunta(ModalPostEmision.tieneCorrelativo())).toBe(true);
        expect(await cajero.pregunta(AccionesPostEmisionCompletas())).toBe(true);
    });
});
