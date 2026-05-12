// SC-22: Editar precio | SC-23: Bloquear precio inválido | SC-24: Editar nombre
import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {EditarPrecioDeItem} from '../../../../src/task/PuntoVenta/EditarPrecioDeItem.task';
import {IntentarPrecioInvalido} from '../../../../src/task/PuntoVenta/IntentarPrecioInvalido.task';
import {EditarNombreDeItem} from '../../../../src/task/PuntoVenta/EditarNombreDeItem.task';
import {AbrirTotales} from '../../../../src/interactions/PuntoVenta/AbrirTotales';
import {CerrarTotales} from '../../../../src/interactions/PuntoVenta/CerrarTotales';
import {ClickAceptarModal} from '../../../../src/interactions/PuntoVenta/ClickAceptarModal';
import {MensajeVisible} from '../../../../src/question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Selección, edición de ítem en caja de venta — Edición de ítem', () => {
    test('SC-22: Editar el precio unitario de un ítem en el carrito', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(EditarPrecioDeItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL, '20'));
        await cajero.intentaRealizar(AbrirTotales());
        expect(await cajero.pregunta(MensajeVisible('Operaciones Gravadas16.95'))).toBe(true);
        await cajero.intentaRealizar(CerrarTotales());
        expect(await cajero.pregunta(MensajeVisible('IGVS/3.05'))).toBe(true);
        expect(await cajero.pregunta(MensajeVisible('SubtotalS/16.05'))).toBe(true);
    });

    test('SC-23: Bloquear edición con precio inválido', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IntentarPrecioInvalido(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL, '0.0000.'));
        expect(await cajero.pregunta(
            MensajeVisible('El valor unitario que se ingresa en la lista de ítems no puede ser negativo ni cero')
        )).toBe(true);
        await cajero.intentaRealizar(ClickAceptarModal());
    });

    test('SC-24: Editar el nombre de un producto en el carrito', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(EditarNombreDeItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL, 'Nombre de item editado'));
        await cajero.intentaRealizar(AbrirTotales());
        expect(await cajero.pregunta(MensajeVisible('Operaciones Gravadas8.69'))).toBe(true);
        await cajero.intentaRealizar(CerrarTotales());
        expect(await cajero.pregunta(MensajeVisible('IGVS/ 1.56'))).toBe(true);
        expect(await cajero.pregunta(MensajeVisible('SubtotalS/8.69'))).toBe(true);
    });
});
