import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {AgregarDosItemsYEliminarUno} from '@task/PuntoVenta/AgregarDosItemsYEliminarUno.task';
import {AgregarItemConSelectorYEliminar} from '@task/PuntoVenta/AgregarItemConSelectorYEliminar.task';
import {AgregarItemsYLimpiarCarrito} from '@task/PuntoVenta/AgregarItemsYLimpiarCarrito.task';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {CalculosTotales} from '@question/PuntoVenta/FilaEnTotales';
import {TotalEnCarrito} from '@question/PuntoVenta/TotalEnCarrito';
import {calcularTotalesCombinados} from '@utils/precio-item.helper';
import {DesplegarPanelCalculos} from '../../../../../src/interactions/PuntoVenta/DesplegarPanelCalculos';

test.describe('Selección, edición de ítem en caja de venta — Eliminar ítems', {tag: ['@punto-venta', '@seleccion-edicion-item', '@eliminar-items']}, () => {
    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-25: Eliminar un ítem del carrito @PV-18.25', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            AgregarDosItemsYEliminarUno(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL, ITEMS_PV.PRODUCTO_GRAVADO, 1)
        );
        const totalesRestantes = calcularTotalesCombinados([
            
            {key: 'PRODUCTO_GRAVADO', cantidad: 1},
        ]);

        await cajero.intentaRealizar(DesplegarPanelCalculos());
        expect(await cajero.pregunta(CalculosTotales('Subtotal', totalesRestantes.subtotalConPrefijo))).toBe(true);
        expect(
            await cajero.pregunta(CalculosTotales("IGV", totalesRestantes.igvConPrefijo)),
        ).toBe(true);
        expect(await cajero.pregunta(TotalEnCarrito(totalesRestantes.total))).toBe(true);
    });

    test('SC-26: Eliminar un ítem con selector del carrito @PV-18.26', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(AgregarItemConSelectorYEliminar(ITEMS_PV.ITEM_SELECTOR_FLEXIBLE));
        expect(await cajero.pregunta(TotalEnCarrito('0.00'))).toBe(true);
    });

    test('SC-27: Limpiar todos los ítems del carrito @PV-18.27', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(AgregarItemsYLimpiarCarrito(ITEMS_PV.LISTA_ITEMS));
        expect(await cajero.pregunta(TotalEnCarrito("0.00"))).toBe(true);
    });
});
