import {test, expect} from '../../../../../src/fixtures/PuntoVenta/guias-fixture';
import {GuiaRemitentePage} from '../../../../../src/pages/PuntoVenta/guias-remision/GuiaRemitentePage';
import {GUIAS_DATA} from '../../../../../src/helpers/PuntoVenta/guias-data.helper';
import {NavegarAGuiaRemitente} from '@task/PuntoVenta/guias-remision/NavegarAGuiaRemitente.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';

test.describe('Guías de Remisión Remitente', {
 tag: ['@guias', '@puntoventa'] }, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaRemitente()
        );
    });

    test('P14: Validar contenedor y precinto obligatorios @GR-14', async ({ cajero, page}) => {
        const guiaPage = new GuiaRemitentePage(page);

        await guiaPage.seleccionarMotivo(GUIAS_DATA.MOTIVOS_TRASLADO.TRASLADO_MERCANCIA_EXTRANJERA);
        await guiaPage.completarDam('2024/124-4567-30-12345');
        await guiaPage.seleccionarDestinatario(GUIAS_DATA.DESTINATARIO.DNI, GUIAS_DATA.DESTINATARIO.NOMBRE_DNI);
        await guiaPage.completarPuntoPartidaYLlegada(
            GUIAS_DATA.DESTINATARIO.UBIGEO,
            GUIAS_DATA.DESTINATARIO.DIRECCION,
            GUIAS_DATA.REMITENTE.DIRECCION
        );
        await guiaPage.seleccionarConductor(GUIAS_DATA.REMITENTE.DNI);
        await guiaPage.completarPlacaYLicencia(GUIAS_DATA.TRANSPORTISTA.PLACA, GUIAS_DATA.TRANSPORTISTA.LICENCIA);
        await guiaPage.seleccionarTransportista(GUIAS_DATA.TRANSPORTISTA.RUC);
        await guiaPage.completarMTC(GUIAS_DATA.TRANSPORTISTA.MTC);
        await guiaPage.buscarYSeleccionarItem(GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.codigo);
        await guiaPage.definirPesoTotal('Kg', '10');

        // Activar contenedor pero dejar campos vacíos
        await page.locator('div').filter({ hasText: /^Sin Contenedor$/ }).nth(2).click();
        await page.getByText('Con Contenedor').click();

        await guiaPage.emitirGuia();

        await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
          - text: Contenedor 1 *
          - textbox
          - text: Campo obligatorio
        `);
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
          - text: Precinto 1 *
          - textbox
          - text: Campo obligatorio
        `);
    });
});