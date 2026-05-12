import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {ActivarSelectorObligatorio} from '@task/PuntoVenta/ActivarSelectorObligatorio.task';
import {BuscarYAgregarConSelectores} from '@task/PuntoVenta/BuscarYAgregarConSelectores.task';
import {IntentarAgregarSinSelectores} from '@task/PuntoVenta/IntentarAgregarSinSelectores.task';
import {AbrirTotales} from '../../../../src/interactions/PuntoVenta/AbrirTotales';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Selección, edición de ítem en caja de venta — Selectores', () => {

    test('SC-14: Buscar y agregar un ítem con selectores obligatorios', async ({page}) => {
        const cajero = Cajero.con(page);

        // Setup: activar switch Obligatorio en el item (idempotente)
        await cajero.intentaRealizar(
            ActivarSelectorObligatorio(ITEMS_PV.ITEM_SELECTOR_GRAVADO.codigo)
        );

        // Navegar a caja y agregar item con selectores
        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            BuscarYAgregarConSelectores(ITEMS_PV.ITEM_SELECTOR_GRAVADO),
            AbrirTotales()
        );

        expect(await cajero.pregunta(MensajeVisible('Operaciones Gravadas18.64'))).toBe(true);
    });

    test('SC-15: Bloquear agregado de ítem con selectores incompletos', async ({page}) => {
        const cajero = Cajero.con(page);

        // Este test necesita navegar a caja primero
        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            IntentarAgregarSinSelectores(ITEMS_PV.ITEM_SELECTOR_GRAVADO)
        );

        expect(await cajero.pregunta(MensajeVisible('Selector obligatorio'))).toBe(true);
    });
});
