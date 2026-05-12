// 📁 tests/Emisiones/PuntoVenta/PV-18_nuevos-casos-caja/agregar-items-basicos.spec.ts
// SC-03: Buscar y agregar producto con control de stock
// SC-04: Bloquear producto sin stock disponible
// SC-05: Agregar producto con stock flexible
// SC-06: Agregar producto sin control de stock
import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '../../../../src/task/PuntoVenta/IniciarVentaEnCaja';
import {BuscarYAgregarItemSimple} from '../../../../src/task/PuntoVenta/BuscarYAgregarItemSimple.task';
import {IntentarAgregarSobrepasandoStock} from '../../../../src/task/PuntoVenta/IntentarAgregarSobrepasandoStock.task';
import {MensajeVisible} from '../../../../src/question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Selección, edición de ítem en caja de venta — Items básicos', () => {

    test('SC-03: Buscar y agregar un producto con control de stock', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            BuscarYAgregarItemSimple(ITEMS_PV.PRODUCTO_SIMPLE)
        );

        expect(await cajero.pregunta(MensajeVisible(ITEMS_PV.PRODUCTO_SIMPLE.nombre))).toBe(true);
    });

    test('SC-04: Bloquear producto sin stock disponible', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            IntentarAgregarSobrepasandoStock(ITEMS_PV.PRODUCTO_SIN_STOCK, 8)
        );

        expect(await cajero.pregunta(
            MensajeVisible('No puedes agregar este ítem a tu venta sobrepasando el stock disponible')
        )).toBe(true);
    });

    test('SC-05: Agregar un producto con stock flexible', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            BuscarYAgregarItemSimple(ITEMS_PV.PRODUCTO_GRAVADO)
        );

        expect(await cajero.pregunta(MensajeVisible(ITEMS_PV.PRODUCTO_GRAVADO.nombre))).toBe(true);
    });

    test('SC-06: Agregar un producto sin control de stock', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            BuscarYAgregarItemSimple(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL)
        );

        expect(await cajero.pregunta(MensajeVisible(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre))).toBe(true);
    });
});
