import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {IntentarAgregarComboSinStock} from '@task/PuntoVenta/IntentarAgregarComboSinStock.task';
import {IntentarAgregarRecetaSinStock} from '@task/PuntoVenta/IntentarAgregarRecetaSinStock.task';
import {IntentarAgregarListaSinStock} from '@task/PuntoVenta/IntentarAgregarListaSinStock.task';
import {ClickAceptarModal} from '../../../../src/interactions/PuntoVenta/ClickAceptarModal';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Selección, edición de ítem en caja de venta — Bloqueos por stock', () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-16: Bloquear combo cuando un componente no tiene stock', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IntentarAgregarComboSinStock(ITEMS_PV.COMBO_EXONERADO)
        );
        expect(await cajero.pregunta(
            MensajeVisible('No puedes agregar este ítem a tu venta sobrepasando el stock disponible')
        )).toBe(true);
        await cajero.intentaRealizar(ClickAceptarModal());
    });

    test('SC-17: Bloquear receta cuando un componente no tiene stock', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IntentarAgregarRecetaSinStock(ITEMS_PV.RECETA_SIN_STOCK)
        );
        expect(await cajero.pregunta(
            MensajeVisible(`${ITEMS_PV.RECETA_SIN_STOCK.nombre} (${ITEMS_PV.PRODUCTO_SIN_STOCK.nombre})`)
        )).toBe(true);
        await cajero.intentaRealizar(ClickAceptarModal());
    });

    test('SC-18: Bloquear lista cuando un producto no tiene stock', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IntentarAgregarListaSinStock(ITEMS_PV.LISTA_SIN_STOCK)
        );
        expect(await cajero.pregunta(
            MensajeVisible('No puedes agregar el item a tu venta porque no tienes stock')
        )).toBe(true);
        await cajero.intentaRealizar(ClickAceptarModal());
    });
});
