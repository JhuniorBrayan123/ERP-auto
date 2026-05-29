import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {DisminuirCantidadItem} from '@task/PuntoVenta/DisminuirCantidadItem.task';
import {IntentarCantidadInvalida} from '@task/PuntoVenta/IntentarCantidadInvalida.task';
import {AbrirTotales} from '../../../../../src/interactions/PuntoVenta/AbrirTotales';
import {DesplegarPanelCalculos} from '../../../../../src/interactions/PuntoVenta/DesplegarPanelCalculos';
import {ClickAceptarModal} from '../../../../../src/interactions/PuntoVenta/ClickAceptarModal';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {FilaEnTotales} from '@question/PuntoVenta/FilaEnTotales';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';

test.describe('Selección, edición de ítem en caja de venta — Edición de cantidad', {tag: ['@punto-venta', '@seleccion-edicion-item', '@edicion-cantidad']}, () => {
    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-19: Incrementar cantidad de un ítem desde el carrito @PV-18.19', async ({page}) => {
        const cajero = Cajero.con(page);
        const emision = new EmisionPage(page);

        await emision.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
        await emision.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
        await cajero.intentaRealizar(DesplegarPanelCalculos());
        const totalesBase = await emision.capturarResumenPedido();
        const subtotalBase = parseFloat(totalesBase['Subtotal'] || '0');
        console.log('[SC-19] Totales base (qty=1):', totalesBase);
        await emision.incrementarCantidad(3);
        const totalesFinal = await emision.capturarResumenPedido();
        const subtotalFinal = parseFloat(totalesFinal['Subtotal'] || '0');
        console.log('[SC-19] Totales finales (qty=4):', totalesFinal);

        expect(subtotalFinal).toBeCloseTo(subtotalBase * 4, 1);
        expect(subtotalFinal).toBeGreaterThan(0);
    });

    test('SC-20: Disminuir cantidad de un ítem desde el carrito @PV-18.20', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(DisminuirCantidadItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL, 6, 7));
        await cajero.intentaRealizar(AbrirTotales());
        expect(await cajero.pregunta(FilaEnTotales('Operaciones Gravadas', '0.00'))).toBe(true);
    });

    test('SC-21: Bloquear cantidad inválida al editar un ítem del carrito @PV-18.21', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IntentarCantidadInvalida(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL));
        expect(await cajero.pregunta(
            MensajeVisible('La Cantidad en la lista de ítems no puede ser negativo o cero')
        )).toBe(true);
        await cajero.intentaRealizar(ClickAceptarModal());
    });
});
