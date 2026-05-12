// 📁 tests/Emisiones/PuntoVenta/PV-18_nuevos-casos-caja/bloqueos-stock.spec.ts
// SC-16: Bloquear combo sin stock en componente
// SC-17: Bloquear receta sin stock en componente
// SC-18: Bloquear lista sin stock en producto
import { expect, test } from '@playwright/test';
import { Cajero } from '../../../../src/actors/cajero';
import { IntentarAgregarComboSinStock } from '../../../../src/task/PuntoVenta/IntentarAgregarComboSinStock.task';
import { IntentarAgregarRecetaSinStock } from '../../../../src/task/PuntoVenta/IntentarAgregarRecetaSinStock.task';
import { IntentarAgregarListaSinStock } from '../../../../src/task/PuntoVenta/IntentarAgregarListaSinStock.task';
import { ClickAceptarModal } from '../../../../src/interactions/PuntoVenta/ClickAceptarModal';
import { MensajeVisible } from '../../../../src/question/PuntoVenta/MensajeVisible';
import { ITEMS_PV } from '../../../../src/helpers/PuntoVenta/emision-data.helper';


test.describe('Selección, edición de ítem en caja de venta — Bloqueos por stock', () => {

    test('SC-16: Bloquear combo cuando un componente no tiene stock', async ({ page }) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            IntentarAgregarComboSinStock(ITEMS_PV.COMBO_EXONERADO)
        );

        expect(await cajero.pregunta(
            MensajeVisible('No puedes agregar este ítem a tu venta sobrepasando el stock disponible')
        )).toBe(true);

        await cajero.intentaRealizar(ClickAceptarModal());
    });

    test('SC-17: Bloquear receta cuando un componente no tiene stock', async ({ page }) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            IntentarAgregarRecetaSinStock(ITEMS_PV.RECETA_SIN_STOCK)
        );

        expect(await cajero.pregunta(
            MensajeVisible(`${ITEMS_PV.RECETA_SIN_STOCK.nombre} (${ITEMS_PV.PRODUCTO_SIN_STOCK.nombre})`)
        )).toBe(true);

        await cajero.intentaRealizar(ClickAceptarModal());
    });

    test('SC-18: Bloquear lista cuando un producto no tiene stock', async ({ page }) => {
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
