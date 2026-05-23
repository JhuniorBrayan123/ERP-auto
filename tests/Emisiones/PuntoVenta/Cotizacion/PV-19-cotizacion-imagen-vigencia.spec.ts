import { test, expect } from '@fixtures/PuntoVenta/emision-fixture';
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
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIMPLE),
            ActivarImagenDescripcion(true, true)
        );

        // La interacción de hacer click se puede hacer directo aquí o en una interaction dedicada.
        // Lo mantendremos delegando en emisionPage para mantenerlo simple.
        await test.step('Abrir vista previa', async () => {
            const emisionPage = new EmisionPage(page);
            await emisionPage.clickVistaPrevia();
        });

        expect(await cajero.pregunta(VistaPreviaCotizacion.contieneImagen())).toBe(true);
        expect(await cajero.pregunta(VistaPreviaCotizacion.contieneDescripcion(ITEMS_PV.PRODUCTO_SIMPLE.nombre))).toBe(true);
    });

    test('C4: Cotización con vigencia de oferta configurada', async ({ page }) => {
        const cajero = Cajero.con(page);
        
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.COTIZACION),
            ConfigurarVigenciaCotizacion('40 días')
        );

        await expect(page.getByText('40 días', { exact: true })).toBeVisible();
    });
});
