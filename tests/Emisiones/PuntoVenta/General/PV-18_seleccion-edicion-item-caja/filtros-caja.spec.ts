import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {FiltrarPorListaPrecios} from '@task/PuntoVenta/FiltrarPorListaPrecios.task';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ALMACENES_PV, ITEMS_POR_ALMACEN} from '@helpers/PuntoVenta/emision-data.helper';
import {FiltrarBuscarYVerificarItem} from "@task/PuntoVenta/FiltrarPorAlmacenUnico";

test.describe('Selección, edición de ítem en caja de venta — Filtros', () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-01: Filtrar ítems por almacén', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            FiltrarBuscarYVerificarItem(ALMACENES_PV.VENTAS, ITEMS_POR_ALMACEN.SOLO_EN_VENTAS)
        );
        expect(await cajero.pregunta(
            MensajeVisible(ITEMS_POR_ALMACEN.SOLO_EN_VENTAS.nombre)
        )).toBe(true);
        await cajero.intentaRealizar(
            FiltrarBuscarYVerificarItem(ALMACENES_PV.AUTO, ITEMS_POR_ALMACEN.SOLO_EN_VENTAS)
        );
        expect(await cajero.pregunta(
            MensajeVisible(ITEMS_POR_ALMACEN.SOLO_EN_VENTAS.nombre)
        )).toBe(false);
    });

    test('SC-02: Filtrar ítems por lista de precios', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            FiltrarPorListaPrecios('Precio estándar (S/)', 'Precio dolares ($)')
        );
        // Validar que el símbolo de dólar aparece en el carrito
        expect(await cajero.pregunta(MensajeVisible('$', {exact: true}))).toBe(true);
    });
});
