import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {FiltrarPorAlmacen} from '@task/PuntoVenta/FiltrarPorAlmacen.task';
import {FiltrarPorListaPrecios} from '@task/PuntoVenta/FiltrarPorListaPrecios.task';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ALMACENES_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Selección, edición de ítem en caja de venta — Filtros', () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-01: Filtrar ítems por almacén', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            FiltrarPorAlmacen(ALMACENES_PV.AUTO, ALMACENES_PV.VENTAS)
        );
        // El item se agrega al carrito al seleccionarlo de la grilla filtrada
        expect(await cajero.pregunta(MensajeVisible('.item'))).toBe(true);
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
