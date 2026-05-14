import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {BuscarYAgregarServicio} from '@task/PuntoVenta/BuscarYAgregarServicio.task';
import {BuscarYAgregarReceta} from '@task/PuntoVenta/BuscarYAgregarReceta.task';
import {BuscarYAgregarCombo} from '@task/PuntoVenta/BuscarYAgregarCombo.task';
import {BuscarYAgregarListaProductos} from '@task/PuntoVenta/BuscarYAgregarListaProductos.task';
import {AbrirTotales} from '../../../../src/interactions/PuntoVenta/AbrirTotales';
import {CerrarTotales} from '../../../../src/interactions/PuntoVenta/CerrarTotales';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {TotalDistintoDeCero} from "@question/PuntoVenta/TotalDistintoDeCero";

test.describe('Selección, edición de ítem en caja de venta — Items especiales', () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-07: Buscar y agregar un servicio', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            BuscarYAgregarServicio('servicio')
        );
        expect(await cajero.pregunta(MensajeVisible('S/20.00'))).toBe(true);
    });

    test('SC-08: Buscar y agregar un ítem tipo receta', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            BuscarYAgregarReceta(ITEMS_PV.RECETA_INSUMOS),
            AbrirTotales()
        );
        // Validar que los totales se recalcularon (ya no son 0.00)
        expect(await cajero.pregunta(TotalDistintoDeCero())).toBe(true);
        await cajero.intentaRealizar(CerrarTotales());
    });

    test('SC-09: Buscar y agregar un ítem tipo combo', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            BuscarYAgregarCombo(ITEMS_PV.COMBO_EXONERADO),
            AbrirTotales()
        );
        expect(await cajero.pregunta(MensajeVisible('Operaciones Exoneradas15.00'))).toBe(true);
        await cajero.intentaRealizar(CerrarTotales());
    });

    test('SC-10: Buscar y agregar una lista de productos', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            BuscarYAgregarListaProductos(ITEMS_PV.LISTA_ITEMS)
        );
        expect(await cajero.pregunta(MensajeVisible('Total4 ítems'))).toBe(true);
    });
});
