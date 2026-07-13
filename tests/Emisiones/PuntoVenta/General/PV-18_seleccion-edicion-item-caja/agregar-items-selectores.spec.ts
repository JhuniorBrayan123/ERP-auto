import {expect, test} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {ActivarSelectorObligatorio} from '@task/PuntoVenta/ActivarSelectorObligatorio.task';
import {BuscarYAgregarConSelectores} from '@task/PuntoVenta/BuscarYAgregarConSelectores.task';
import {IntentarAgregarSinSelectores} from '@task/PuntoVenta/IntentarAgregarSinSelectores.task';
import {MensajeVisible} from '@question/PuntoVenta/MensajeVisible';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {calcularTotales} from '@utils/calculadora-impuestos';
import {FilaEnTotales} from '@question/PuntoVenta/FilaEnTotales';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {TotalDistintoDeCero} from '@question/PuntoVenta/TotalDistintoDeCero';
import {AbrirTotales} from '@interactions/PuntoVenta/AbrirTotales';

test.describe('PV-18 | Selectores', {tag: ['@puntoventa', '@pv-18', '@selectores']}, () => {

    test('SC-14: Buscar y agregar un ítem con selectores obligatorios @PV-18.14', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            ActivarSelectorObligatorio(ITEMS_PV.ITEM_SELECTOR_GRAVADO.codigo)
        );

        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            BuscarYAgregarConSelectores(ITEMS_PV.ITEM_SELECTOR_GRAVADO),
        );

        await expect(await cajero.pregunta(TotalDistintoDeCero())).toBe(true);
        await cajero.intentaRealizar(AbrirTotales());
        const emisionPage = new EmisionPage(page);
        const resumen = await emisionPage.capturarResumenPedido();
        const totalCarrito = parseFloat(resumen['Total a Pagar'] || resumen['Total'] || Object.values(resumen).pop() || '0');

        const totales = calcularTotales(totalCarrito, 1, 0.18);
        expect(await cajero.pregunta(FilaEnTotales('Operaciones Gravadas', totales.baseImponible))).toBe(true);
    });

    test('SC-15: Bloquear agregado de ítem con selectores incompletos @PV-18.15', async ({page}) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            IniciarVentaEnCaja(),
            IntentarAgregarSinSelectores(ITEMS_PV.ITEM_SELECTOR_GRAVADO)
        );

        expect(await cajero.pregunta(MensajeVisible('Selector obligatorio'))).toBe(true);
    });
});
