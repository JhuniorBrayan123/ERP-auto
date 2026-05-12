// 📁 tests/Emisiones/PuntoVenta/PV-18_nuevos-casos-caja/filtros-caja.spec.ts
// SC-01: Filtrar ítems por almacén
// SC-02: Filtrar ítems por lista de precios
import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '../../../../src/task/PuntoVenta/IniciarVentaEnCaja';
import {FiltrarPorAlmacen} from '../../../../src/task/PuntoVenta/FiltrarPorAlmacen.task';
import {FiltrarPorListaPrecios} from '../../../../src/task/PuntoVenta/FiltrarPorListaPrecios.task';
import {MensajeVisible} from '../../../../src/question/PuntoVenta/MensajeVisible';
import {ALMACENES_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Selección, edición de ítem en caja de venta — Filtros', () => {

    test('SC-01: Filtrar ítems por almacén', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            FiltrarPorAlmacen(ALMACENES_PV.AUTO, ALMACENES_PV.VENTAS)
        );

        // El item se agrega al carrito al seleccionarlo de la grilla filtrada
        expect(await cajero.pregunta(MensajeVisible('.item'))).toBe(true);
    });

    test('SC-02: Filtrar ítems por lista de precios', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            FiltrarPorListaPrecios('Precio estándar (S/)', 'Precio dolares ($)')
        );

        // Validar que el símbolo de dólar aparece en el carrito
        expect(await cajero.pregunta(MensajeVisible('$', {exact: true}))).toBe(true);
    });
});
