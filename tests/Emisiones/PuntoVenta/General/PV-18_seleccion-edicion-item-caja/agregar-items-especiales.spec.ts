import {expect, test} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {BuscarYAgregarServicio} from '@task/PuntoVenta/BuscarYAgregarServicio.task';
import {BuscarYAgregarReceta} from '@task/PuntoVenta/BuscarYAgregarReceta.task';
import {BuscarYAgregarCombo} from '@task/PuntoVenta/BuscarYAgregarCombo.task';
import {BuscarYAgregarListaProductos} from '@task/PuntoVenta/BuscarYAgregarListaProductos.task';
import {AbrirTotales} from '@interactions/PuntoVenta/AbrirTotales';
import {CerrarTotales} from '@interactions/PuntoVenta/CerrarTotales';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {TotalDistintoDeCero} from "@question/PuntoVenta/TotalDistintoDeCero";

test.describe('PV-18 | Items especiales', {tag: ['@puntoventa', '@pv-18', '@items-especiales']}, () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-07: Buscar y agregar un servicio @PV-18.7', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            BuscarYAgregarServicio('servicio'),

            AbrirTotales()
        );

        expect(await cajero.pregunta(TotalDistintoDeCero())).toBe(true);
        await cajero.intentaRealizar(CerrarTotales());
    });

    test('SC-08: Buscar y agregar un ítem tipo receta @PV-18.8', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            BuscarYAgregarReceta(ITEMS_PV.RECETA_INSUMOS),
            AbrirTotales()
        );

        expect(await cajero.pregunta(TotalDistintoDeCero())).toBe(true);
        await cajero.intentaRealizar(CerrarTotales());
    });

    test('SC-09: Buscar y agregar un ítem tipo combo @PV-18.9', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            BuscarYAgregarCombo(ITEMS_PV.COMBO_ESTRICTO),
            AbrirTotales()
        );

        expect(await cajero.pregunta(TotalDistintoDeCero())).toBe(true);
        await cajero.intentaRealizar(CerrarTotales());
    });

    test('SC-10: Buscar y agregar una lista de productos @PV-18.10', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            BuscarYAgregarListaProductos(ITEMS_PV.LISTA_ITEMS_ESTRICTOS)
        );
        expect(await cajero.pregunta(MensajeVisible('Total5 ítems'))).toBe(true);
    });
});
