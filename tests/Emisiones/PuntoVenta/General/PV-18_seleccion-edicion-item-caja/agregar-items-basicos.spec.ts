import {expect, test} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {BuscarYAgregarItemSimple} from '@task/PuntoVenta/BuscarYAgregarItemSimple.task';
import {IntentarAgregarSobrepasandoStock} from '@task/PuntoVenta/IntentarAgregarSobrepasandoStock.task';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-18 | Items básicos', {tag: ['@puntoventa', '@pv-18', '@items-basicos']}, () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-03: Buscar y agregar un producto con control de stock @PV-18.3', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            BuscarYAgregarItemSimple(ITEMS_PV.PRODUCTO_SIMPLE)
        );
        expect(await cajero.pregunta(MensajeVisible(ITEMS_PV.PRODUCTO_SIMPLE.nombre))).toBe(true);
    });

    test('SC-04: Bloquear producto sin stock disponible @PV-18.4', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IntentarAgregarSobrepasandoStock(ITEMS_PV.PRODUCTO_SIN_STOCK, 8)
        );
        expect(await cajero.pregunta(
            MensajeVisible('No puedes agregar este ítem a tu venta sobrepasando el stock disponible')
        )).toBe(true);
    });

    test('SC-05: Agregar un producto con stock flexible @PV-18.5', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            BuscarYAgregarItemSimple(ITEMS_PV.ESTRICTO_GRAVADO_10)
        );
        expect(await cajero.pregunta(MensajeVisible(ITEMS_PV.ESTRICTO_GRAVADO_10.nombre))).toBe(true);
    });

    test('SC-06: Agregar un producto sin control de stock @PV-18.6', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL)
        );
        expect(await cajero.pregunta(MensajeVisible(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre))).toBe(true);
    });
});
