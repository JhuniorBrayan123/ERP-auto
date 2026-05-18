import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {ActivarSelectorObligatorio} from '@task/PuntoVenta/ActivarSelectorObligatorio.task';
import {BuscarYAgregarConSelectores} from '@task/PuntoVenta/BuscarYAgregarConSelectores.task';
import {IntentarAgregarSinSelectores} from '@task/PuntoVenta/IntentarAgregarSinSelectores.task';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {calcularTotales} from '@utils/calculadora-impuestos';
import {CalculosTotales} from '@question/PuntoVenta/FilaEnTotales';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {TotalDistintoDeCero} from '@question/PuntoVenta/TotalDistintoDeCero';

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
        );

        // Asegurarnos de que el carrito ya sumó el ítem esperando a que el texto cambie
        await expect(await cajero.pregunta(TotalDistintoDeCero())).toBe(true);

        // Capturar el resumen de totales directamente del panel de Totales (que ya está abierto)
        const emisionPage = new EmisionPage(page);
        const resumen = await emisionPage.capturarResumenPedido();
        // El panel de totales muestra un campo "Total a Pagar" o "Total" con el monto total
        const totalCarrito = parseFloat(resumen['Total a Pagar'] || resumen['Total'] || Object.values(resumen).pop() || '0');

        const totales = calcularTotales(totalCarrito, 1, 0.18);
        expect(await cajero.pregunta(CalculosTotales('Operaciones Gravadas', `S/ ${totales.baseImponible}`))).toBe(true);
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
