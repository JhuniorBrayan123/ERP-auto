import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {BuscarYAgregarVariante} from '@task/PuntoVenta/BuscarYAgregarVariante.task';
import {IntentarAgregarVarianteSinStock} from '@task/PuntoVenta/IntentarAgregarVarianteSinStock.task';
import {BuscarYAgregarEquivalencia} from '@task/PuntoVenta/BuscarYAgregarEquivalencia.task';
import {DesplegarPanelCalculos} from '../../../../../src/interactions/PuntoVenta/DesplegarPanelCalculos';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';

test.describe('Selección, edición de ítem en caja de venta — Variantes y equivalencias', {tag: ['@punto-venta', '@seleccion-edicion-item', '@variantes']}, () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-11: Buscar y agregar un ítem con variante @PV-18.11', async ({page}) => {
        const cajero = Cajero.con(page);
        const emision = new EmisionPage(page);

        await cajero.intentaRealizar(
            BuscarYAgregarVariante(ITEMS_PV.ITEM_VARIANTE_FLEXIBLE),
        );

        await cajero.intentaRealizar(DesplegarPanelCalculos());
        const resumen = await emision.capturarResumenPedido();
        console.log('[SC-11] Totales capturados:', resumen);

        const subtotal = parseFloat(resumen['Subtotal'] || '0');
        const igv = parseFloat(resumen['IGV'] || '0');
        const total = parseFloat(resumen['Total'] || '0');

        expect(subtotal).toBeGreaterThan(0);
        expect(igv).toBeGreaterThan(0);
        expect(total).toBeGreaterThan(0);
        expect(subtotal + igv).toBeCloseTo(total, 1);
    });

    test('SC-12: Bloquear agregado de variante sin stock @PV-18.12', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IntentarAgregarVarianteSinStock(ITEMS_PV.ITEM_VARIANTE_ESTRICTO, 25)
        );
        expect(await cajero.pregunta(
            MensajeVisible('No puedes agregar este ítem a tu venta sobrepasando el stock disponible')
        )).toBe(true);
    });

    test('SC-13: Buscar y agregar un ítem con equivalencia @PV-18.13', async ({page}) => {
        const cajero = Cajero.con(page);
        const emision = new EmisionPage(page);

        await cajero.intentaRealizar(
            BuscarYAgregarEquivalencia(ITEMS_PV.ITEM_EQUIVALENTE, 'Equivalente X2'),
        );
        await cajero.intentaRealizar(DesplegarPanelCalculos());
        const resumen = await emision.capturarResumenPedido();
        console.log('[SC-13] Totales capturados:', resumen);
        const subtotal = parseFloat(resumen['Subtotal'] || '0');
        const igv = parseFloat(resumen['IGV'] || '0');
        const total = parseFloat(resumen['Total'] || '0');
        expect(subtotal).toBeGreaterThan(0);
        expect(igv).toBeGreaterThan(0);
        expect(total).toBeGreaterThan(0);
        expect(subtotal + igv).toBeCloseTo(total, 1);
    });
});
