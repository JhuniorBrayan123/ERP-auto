// SC-25: Eliminar ítem | SC-26: Eliminar ítem con selector | SC-27: Limpiar carrito
import { expect, test } from '@playwright/test';
import { Cajero } from '../../../../src/actors/cajero';
import { AgregarDosItemsYEliminarUno } from '../../../../src/task/PuntoVenta/AgregarDosItemsYEliminarUno.task';
import { AgregarItemConSelectorYEliminar } from '../../../../src/task/PuntoVenta/AgregarItemConSelectorYEliminar.task';
import { AgregarItemsYLimpiarCarrito } from '../../../../src/task/PuntoVenta/AgregarItemsYLimpiarCarrito.task';
import { MensajeVisible } from '../../../../src/question/PuntoVenta/MensajeVisible';
import { ITEMS_PV } from '../../../../src/helpers/PuntoVenta/emision-data.helper';

test.describe('Selección, edición de ítem en caja de venta — Eliminar ítems', () => {
    test('SC-25: Eliminar un ítem del carrito', async ({ page }) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            AgregarDosItemsYEliminarUno(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL, ITEMS_PV.PRODUCTO_GRAVADO, 1)
        );
        expect(await cajero.pregunta(MensajeVisible('SubtotalS/ 13.15'))).toBe(true);
    });

    test('SC-26: Eliminar un ítem con selector del carrito', async ({ page }) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(AgregarItemConSelectorYEliminar(ITEMS_PV.ITEM_SELECTOR_FLEXIBLE));
        expect(await cajero.pregunta(MensajeVisible('0.00', { exact: true }))).toBe(true);
    });

    test('SC-27: Limpiar todos los ítems del carrito', async ({ page }) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(AgregarItemsYLimpiarCarrito(ITEMS_PV.LISTA_ITEMS));
        expect(await cajero.pregunta(MensajeVisible('0.00', { exact: true }))).toBe(true);
    });
});
