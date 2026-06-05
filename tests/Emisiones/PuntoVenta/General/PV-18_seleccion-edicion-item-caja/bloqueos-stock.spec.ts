import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {IntentarAgregarComboSinStock} from '@task/PuntoVenta/IntentarAgregarComboSinStock.task';
import {IntentarAgregarRecetaSinStock} from '@task/PuntoVenta/IntentarAgregarRecetaSinStock.task';
import {IntentarAgregarListaSinStock} from '@task/PuntoVenta/IntentarAgregarListaSinStock.task';
import {ClickAceptarModal} from '@interactions/PuntoVenta/ClickAceptarModal';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Selección, edición de ítem en caja de venta — Bloqueos por stock', {tag: ['@punto-venta', '@seleccion-edicion-item', '@bloqueos-stock']}, () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-16: Bloquear combo cuando un componente no tiene stock @PV-18.16', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IntentarAgregarComboSinStock(ITEMS_PV.COMBO_STOCK_BAJO_ITEM),
        );
        await expect(
            page.getByText('No puedes agregar el item a tu venta porque no tienes stock').first(),
            'El sistema no validó el stock y dejó agregar el combo a pesar de que un ítem no tiene stock'
        ).toBeVisible({timeout: 15_000});

        await cajero.intentaRealizar(ClickAceptarModal());
    });

    test('SC-17: Bloquear receta cuando un componente no tiene stock @PV-18.17', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IntentarAgregarRecetaSinStock(ITEMS_PV.RECETA_SIN_STOCK)
        );
        await expect(
            page.getByText(`${ITEMS_PV.RECETA_SIN_STOCK.nombre} (${ITEMS_PV.PRODUCTO_SIN_STOCK.nombre})`).first(),
            'El sistema no validó el stock y dejó agregar la receta a pesar de que un componente no tiene stock'
        ).toBeVisible({timeout: 15_000});

        await cajero.intentaRealizar(ClickAceptarModal());
    });

    test('SC-18: Bloquear lista cuando un producto no tiene stock @PV-18.18', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IntentarAgregarListaSinStock(ITEMS_PV.LISTA_SIN_STOCK)
        );
        await expect(
            page.getByText('No puedes agregar el item a tu venta porque no tienes stock').first()
        ).toBeVisible({timeout: 15_000});

        await cajero.intentaRealizar(ClickAceptarModal());
    });
});
