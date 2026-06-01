import {test, expect} from '../../../../../src/fixtures/PuntoVenta/guias-fixture';
import {GuiaRemitentePage} from '../../../../../src/pages/PuntoVenta/guias-remision/GuiaRemitentePage';
import {GUIAS_DATA} from '../../../../../src/helpers/PuntoVenta/guias-data.helper';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import type {Page} from '@playwright/test';

test.describe('Guías de Remisión Remitente', {
 tag: ['@guias', '@puntoventa'] }, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(IniciarVentaEnCaja('caja-auto'));
    });

    test('P15: Emitir guía vinculando un comprobante @GR-15', async ({cajero, page}) => {
        // 1. Emitir Factura como precondición
        await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
        await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]').click();
        await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
        await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).fill(GUIAS_DATA.DESTINATARIO.RUC);
        await page.getByText(GUIAS_DATA.DESTINATARIO.NOMBRE_RUC).click();
        await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
        await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill(GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.codigo);
        await page.getByText(GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.nombre).click();
        await page.getByRole('button', { name: 'PAGAR' }).click();
        await page.getByRole('button', { name: 'Monto exacto' }).click();
        await page.getByRole('button', { name: 'Realizar Pago' }).click();
        await expect(page.getByText('¡Buen trabajo!')).toBeVisible();

        // 2. Capturar correlativo de la factura emitida
        const bodyText = await page.locator('body').innerText();
        const correlativoMatch = bodyText.match(/F001-(\d+)/);
        const correlativo = correlativoMatch ? correlativoMatch[1] : '1';

        // 3. Ir a Nueva Venta y luego a Guía de Remisión Remitente
        await page.getByRole('button', { name: 'Nueva Venta' }).click();
        await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
        await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-3005"]').click();

        // 4. Vincular comprobante
        await page.getByRole('button', { name: 'Vincular comprobante' }).click();
        await page.locator('[id="pv_cmp-guia-remision-remitente_cmp-modal-vincular-comprobante:form-vincular-comprobante_v-select:serie-comprobante"] div').filter({ hasText: /^F001$/ }).click();
        await page.getByText('F001').nth(1).click();
        await page.getByRole('textbox', { name: 'Ej. 0075' }).click();
        await page.getByRole('textbox', { name: 'Ej. 0075' }).fill(correlativo);
        await page.getByRole('button', { name: 'Buscar' }).click();

        await expect(page.locator('body')).toContainText(`F001-${correlativo}`);
        await expect(page.locator('body')).toContainText(GUIAS_DATA.DESTINATARIO.NOMBRE_RUC);
        await page.getByRole('button', { name: 'Vincular y crear guía' }).click();
        await expect(page.getByText('Comprobante vinculado')).toBeVisible();

        // 5. Completar datos de la guía
        const guiaPage = new GuiaRemitentePage(page);
        await guiaPage.completarPuntoPartidaYLlegada(
            GUIAS_DATA.DESTINATARIO.UBIGEO,
            GUIAS_DATA.DESTINATARIO.DIRECCION,
            GUIAS_DATA.REMITENTE.DIRECCION
        );
        await guiaPage.completarPlacaYLicencia(GUIAS_DATA.TRANSPORTISTA.PLACA, GUIAS_DATA.TRANSPORTISTA.LICENCIA);
        await guiaPage.seleccionarTransportista(GUIAS_DATA.TRANSPORTISTA.RUC);
        await guiaPage.completarMTC(GUIAS_DATA.TRANSPORTISTA.MTC);
        await guiaPage.definirPesoTotal('Kg', '10.45');
        await guiaPage.emitirGuia();

        // 6. Validar emisión exitosa
        await expect(page.getByText('¡Buen trabajo!')).toBeVisible();
        await expect(page.getByText('Tu comprobante fue emitido')).toBeVisible();
    });
});