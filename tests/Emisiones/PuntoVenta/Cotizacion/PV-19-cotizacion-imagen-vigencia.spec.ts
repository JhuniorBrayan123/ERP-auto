import { test, expect } from '@playwright/test';
import { Cajero } from '../../../../src/actors/cajero';
import { IniciarVentaEnCaja } from '@task/PuntoVenta/IniciarVentaEnCaja';
import { SeleccionarTipoComprobante } from '@task/PuntoVenta/SeleccionarTipoComprobante.task';
import { AgregarItemAlCarrito } from '@task/PuntoVenta/AgregarItemAlCarrito.task';
import { ConfigurarVigenciaCotizacion } from '@task/PuntoVenta/ConfigurarVigenciaCotizacion.task';
import { ActivarImagenDescripcion } from '@task/PuntoVenta/ActivarImagenDescripcion.task';
import { VistaPreviaCotizacion } from '@question/PuntoVenta/VistaPreviaCotizacion.question';
import { EmisionPage } from '@pages/PuntoVenta/EmisionPage';
import { TIPOS_COMPROBANTE, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';


test.describe('PV-19: Opciones adicionales de Cotización', () => {
    test.beforeEach(async ({ page }) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('C3: Cotización con imagen y descripción (Vista Previa)', async ({ page }) => {
        const cajero = Cajero.con(page);

        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.COTIZACION),
            AgregarItemAlCarrito(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            ActivarImagenDescripcion(true, true)
        );
        await test.step('Abrir vista previa', async () => {
            const emisionPage = new EmisionPage(page);
            await emisionPage.clickVistaPrevia();
        });

        expect(await cajero.pregunta(VistaPreviaCotizacion.contieneImagen())).toBe(true);
        expect(await cajero.pregunta(VistaPreviaCotizacion.contieneDescripcion(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre))).toBe(true);
    });

    test('C4: Cotización con vigencia de oferta configurada', async ({ page }) => {
        const cajero = Cajero.con(page);

        const opcionesDisponibles = [
            '0 días', '1 día', '3 días', '5 días', '7 días',
            '10 días', '15 días', '20 días', '45 días', '50 días'
        ];
        const vigenciaAleatoria = opcionesDisponibles[Math.floor(Math.random() * opcionesDisponibles.length)];
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.COTIZACION),
            ConfigurarVigenciaCotizacion(vigenciaAleatoria)
        );

        await expect(page.getByText(vigenciaAleatoria, { exact: true }).first()).toBeVisible();
    });
});
