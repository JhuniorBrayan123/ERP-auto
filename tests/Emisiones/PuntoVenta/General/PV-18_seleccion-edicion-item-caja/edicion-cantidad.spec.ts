import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {IncrementarCantidadItem} from '@task/PuntoVenta/IncrementarCantidadItem.task';
import {DisminuirCantidadItem} from '@task/PuntoVenta/DisminuirCantidadItem.task';
import {IntentarCantidadInvalida} from '@task/PuntoVenta/IntentarCantidadInvalida.task';
import {AbrirTotales} from '../../../../../src/interactions/PuntoVenta/AbrirTotales';
import {ClickAceptarModal} from '../../../../../src/interactions/PuntoVenta/ClickAceptarModal';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {FilaEnTotales} from '@question/PuntoVenta/FilaEnTotales';
import {calcularTotalesDeItem} from "@utils/precio-item.helper";

test.describe('Selección, edición de ítem en caja de venta — Edición de cantidad', () => {
    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-19: Incrementar cantidad de un ítem desde el carrito', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IncrementarCantidadItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL, 3));
        const totales = calcularTotalesDeItem('ITEM_GRAVADO_SIN_CONTROL', 4);
        expect(await cajero.pregunta(MensajeVisible(totales.total, {exact: true}))).toBe(true);
        await cajero.intentaRealizar(AbrirTotales());
        expect(await cajero.pregunta(FilaEnTotales('Operaciones Gravadas', totales.subtotal))).toBe(true);
    });

    test('SC-20: Disminuir cantidad de un ítem desde el carrito', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(DisminuirCantidadItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL, 6, 7));
        await cajero.intentaRealizar(AbrirTotales());
        expect(await cajero.pregunta(FilaEnTotales('Operaciones Gravadas', '0.00'))).toBe(true);
    });

    test('SC-21: Bloquear cantidad inválida al editar un ítem del carrito', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IntentarCantidadInvalida(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL));
        expect(await cajero.pregunta(
            MensajeVisible('La Cantidad en la lista de ítems no puede ser negativo o cero')
        )).toBe(true);
        await cajero.intentaRealizar(ClickAceptarModal());
    });
});
