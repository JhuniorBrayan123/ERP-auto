import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {FiltrarPorListaPrecios} from '@task/PuntoVenta/FiltrarPorListaPrecios.task';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ALMACENES_PV, ITEMS_POR_ALMACEN} from '@helpers/PuntoVenta/emision-data.helper';
import {FiltrarBuscarYVerificarItem} from "@task/PuntoVenta/FiltrarPorAlmacenUnico";

test.describe('PV-18 | Filtros de caja', {tag: ['@puntoventa', '@pv-18', '@filtros']}, () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-01: Filtrar ítems por almacén @PV-18.1', async ({page}) => {
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

    test('SC-02: Filtrar ítems por lista de precios @PV-18.2', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            FiltrarPorListaPrecios('Precio estándar (S/)', 'Precio dolares ($)')
        );
        
        expect(await cajero.pregunta(MensajeVisible('$', {exact: true}))).toBe(true);
    });
});
