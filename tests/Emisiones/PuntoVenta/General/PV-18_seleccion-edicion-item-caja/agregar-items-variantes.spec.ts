import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {BuscarYAgregarVariante} from '@task/PuntoVenta/BuscarYAgregarVariante.task';
import {IntentarAgregarVarianteSinStock} from '@task/PuntoVenta/IntentarAgregarVarianteSinStock.task';
import {BuscarYAgregarEquivalencia} from '@task/PuntoVenta/BuscarYAgregarEquivalencia.task';
import {AbrirTotales} from '../../../../../src/interactions/PuntoVenta/AbrirTotales';
import {CerrarTotales} from '../../../../../src/interactions/PuntoVenta/CerrarTotales';
import {FilaEnTotales} from '@question/PuntoVenta/FilaEnTotales';
import {TotalEnCarrito} from '@question/PuntoVenta/TotalEnCarrito';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {calcularTotalesDeItem} from "@utils/precio-item.helper";
import {calcularTotales} from "@utils/calculadora-impuestos";
import {getTemplate} from '../../../../../src/factories/item-factory';

test.describe('Selección, edición de ítem en caja de venta — Variantes y equivalencias', () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-11: Buscar y agregar un ítem con variante', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            BuscarYAgregarVariante(ITEMS_PV.ITEM_VARIANTE_FLEXIBLE),
            AbrirTotales()
        );
        const totales = calcularTotalesDeItem('ITEM_VARIANTE_FLEXIBLE');
        expect(await cajero.pregunta(FilaEnTotales('Operaciones Gravadas', totales.subtotal))).toBe(true);
        await cajero.intentaRealizar(CerrarTotales());
        expect(await cajero.pregunta(TotalEnCarrito(totales.total))).toBe(true);
    });

    test('SC-12: Bloquear agregado de variante sin stock', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            IntentarAgregarVarianteSinStock(ITEMS_PV.ITEM_VARIANTE_ESTRICTO, 25)
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
        const template = getTemplate('ITEM_EQUIVALENTE');
        if (!template) throw new Error('Template ITEM_EQUIVALENTE not found');
        const eq = template.config.equivalencias?.find((e: any) => e.nombre === 'Equivalente X2');
        if (!eq) throw new Error('Equivalencia X2 not found in ITEM_EQUIVALENTE');
        const esperados = calcularTotales(parseFloat(eq.precioVenta), 1, 0.18);
        expect(await cajero.pregunta(FilaEnTotales('Operaciones Gravadas', esperados.baseImponible))).toBe(true);
        await cajero.intentaRealizar(CerrarTotales());
        expect(await cajero.pregunta(TotalEnCarrito(parseFloat(eq.precioVenta).toFixed(2)))).toBe(true);
    });
});
