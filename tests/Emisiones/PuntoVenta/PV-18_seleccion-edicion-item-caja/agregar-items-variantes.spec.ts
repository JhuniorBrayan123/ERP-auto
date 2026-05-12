// 📁 tests/Emisiones/PuntoVenta/PV-18_nuevos-casos-caja/agregar-items-variantes.spec.ts
// SC-11: Buscar y agregar ítem con variante
// SC-12: Bloquear variante sin stock
// SC-13: Buscar y agregar ítem con equivalencia
import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {BuscarYAgregarVariante} from '../../../../src/task/PuntoVenta/BuscarYAgregarVariante.task';
import {IntentarAgregarVarianteSinStock} from '../../../../src/task/PuntoVenta/IntentarAgregarVarianteSinStock.task';
import {BuscarYAgregarEquivalencia} from '../../../../src/task/PuntoVenta/BuscarYAgregarEquivalencia.task';
import {AbrirTotales} from '../../../../src/interactions/PuntoVenta/AbrirTotales';
import {CerrarTotales} from '../../../../src/interactions/PuntoVenta/CerrarTotales';
import {MensajeVisible} from '../../../../src/question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Selección, edición de ítem en caja de venta — Variantes y equivalencias', () => {

    test('SC-11: Buscar y agregar un ítem con variante', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            BuscarYAgregarVariante(ITEMS_PV.ITEM_VARIANTE_FLEXIBLE),
            AbrirTotales()
        );

        expect(await cajero.pregunta(MensajeVisible('Operaciones Gravadas20.90'))).toBe(true);

        await cajero.intentaRealizar(CerrarTotales());

        expect(await cajero.pregunta(MensajeVisible('24.66'))).toBe(true);
    });

    test('SC-12: Bloquear agregado de variante sin stock', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            IntentarAgregarVarianteSinStock(ITEMS_PV.ITEM_VARIANTE_ESTRICTO, 8)
        );

        expect(await cajero.pregunta(
            MensajeVisible('No puedes agregar este ítem a tu venta sobrepasando el stock disponible')
        )).toBe(true);
    });

    test('SC-13: Buscar y agregar un ítem con equivalencia', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            BuscarYAgregarEquivalencia(ITEMS_PV.ITEM_EQUIVALENTE, 'Equivalente X2'),
            AbrirTotales()
        );

        expect(await cajero.pregunta(MensajeVisible('Operaciones Gravadas17.04'))).toBe(true);
        expect(await cajero.pregunta(MensajeVisible('20.11', {exact: true}))).toBe(true);
    });
});
