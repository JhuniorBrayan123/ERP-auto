// SC-19: Incrementar cantidad | SC-20: Disminuir cantidad | SC-21: Bloquear cantidad inválida
import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {IncrementarCantidadItem} from '../../../../src/task/PuntoVenta/IncrementarCantidadItem.task';
import {DisminuirCantidadItem} from '../../../../src/task/PuntoVenta/DisminuirCantidadItem.task';
import {IntentarCantidadInvalida} from '../../../../src/task/PuntoVenta/IntentarCantidadInvalida.task';
import {AbrirTotales} from '../../../../src/interactions/PuntoVenta/AbrirTotales';
import {ClickAceptarModal} from '../../../../src/interactions/PuntoVenta/ClickAceptarModal';
import {MensajeVisible} from '../../../../src/question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Selección, edición de ítem en caja de venta — Edición de cantidad', () => {
    test('SC-19: Incrementar cantidad de un ítem desde el carrito', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IncrementarCantidadItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL, 3));
        expect(await cajero.pregunta(MensajeVisible('41.00', {exact: true}))).toBe(true);
        await cajero.intentaRealizar(AbrirTotales());
        expect(await cajero.pregunta(MensajeVisible('Operaciones Gravadas34.75'))).toBe(true);
    });

    test('SC-20: Disminuir cantidad de un ítem desde el carrito', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(DisminuirCantidadItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL, 6, 7));
        await cajero.intentaRealizar(AbrirTotales());
        expect(await cajero.pregunta(MensajeVisible('Operaciones Gravadas00.00'))).toBe(true);
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
