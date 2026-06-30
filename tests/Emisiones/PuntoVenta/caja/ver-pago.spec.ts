/**
 * Spec: ver-pago.spec.ts
 *
 * Cubre:
 * - Validar acción "Ver Pago" para venta con pago único
 * - Validar acción "Ver Pago" para venta con pago combinado (múltiples métodos)
 * - Validar que venta a crédito NO muestra "Ver Pago"
 */

import {expect} from '@playwright/test';
import {test} from '@fixtures/PuntoVenta/caja.fixture';
import {IrACierreDeCaja} from '@screenplay/tasks/caja/IrACierreDeCaja';
import {RegresarANuevaVenta} from '@screenplay/tasks/caja/AbrirMenuCaja';
import {
    BorrarFiltrosVentas,
    BuscarComprobanteEnVentas,
    CerrarModalVerPago,
    ConsultarVentasDeCaja,
    VerPagoDeComprobante,
} from '@screenplay/tasks/cierre-caja/ConsultarVentasDeCaja';
import {VerPagoEsVisible} from '@screenplay/questions/cierre-caja/ComprobanteVisibleEnVentas';
import {ValidarModalVerPago} from '@screenplay/tasks/cierre-caja/ValidarModalVerPago';
import {EmitirComprobanteOrigen} from '@screenplay/tasks/common/EmitirComprobanteOrigen';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import {ClientePage} from '@pages/PuntoVenta/ClientePage';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';

test.describe('Ver Pago en Cierre de Caja', () => {
    test.describe.configure({mode: 'serial'});

    test('validar "Ver Pago" para venta con pago único (POS VISA)', async ({cajero, page}) => {
        // ── Arrange: emitir nota de venta con un único método de pago ────────
        const comprobante = await cajero.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: 'NOTA DE VENTA',
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
            }),
        );

        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarVentasDeCaja(),
            BuscarComprobanteEnVentas({
                tipoDocumento: 'Nota de Venta',
                correlativo: comprobante.correlativo,
            }),
            VerPagoDeComprobante(),
            ValidarModalVerPago('NOTA DE VENTA', comprobante.correlativo),
            CerrarModalVerPago(),
            BorrarFiltrosVentas(),
            RegresarANuevaVenta()
        );
    });

    test('validar "Ver Pago" para venta con pago combinado (múltiples métodos)', async ({cajero, page}) => {
        // ── Arrange ──────────────────────────────────────────────────────────
        // Usamos los Page Objects existentes para preparar el comprobante
        const comprobantePage = new ComprobantePage(page);
        const clientePage = new ClientePage(page);
        const emisionPage = new EmisionPage(page);

        // Seleccionamos BOLETA
        await comprobantePage.seleccionarTipoComprobante('BOLETA');

        // Agregamos clientex
        await clientePage.buscarCliente(CLIENTES.PERSONA_DNI.documento);
        await clientePage.seleccionarClientePorTexto(CLIENTES.PERSONA_DNI.nombre);

        // Agregamos ítem
        await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
        await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);

        // Vamos a la ventana de pago
        await emisionPage.clickPagar();

        // Activar switch de pago combinado
        await page.locator('.switch-monto .slider').click();

        const filasMetodo = page.locator('.metodo');

        // 1er método: EFECTIVO (Fila 0)
        await filasMetodo.nth(0).getByText('Seleccionar método').click();
        await page.waitForTimeout(300); // Esperar animación del dropdown
        await page.locator('.v-select-base-options.is-open').getByText('EFECTIVO', { exact: true }).first().click();
        await filasMetodo.nth(0).locator('input[id*="v-input:monto-"]').fill('2.5');

        // 2do método: VOUCHER (Fila 1)
        await filasMetodo.nth(1).getByText('Seleccionar método').click();
        await page.waitForTimeout(300);
        await page.locator('.v-select-base-options.is-open').getByText('VOUCHER', { exact: true }).first().click();
        await filasMetodo.nth(1).locator('input[id*="v-input:numero-operacion-"]').fill('32');
        await filasMetodo.nth(1).locator('input[id*="v-input:monto-"]').fill('5.5');

        // 3er método: POS VISA (Fila 2)
        await filasMetodo.nth(2).getByText('Seleccionar método').click();
        await page.waitForTimeout(300);
        await page.locator('.v-select-base-options.is-open').getByText('POS VISA', { exact: true }).first().click();
        await filasMetodo.nth(2).locator('input[id*="v-input:numero-operacion-"]').fill('12');
        await filasMetodo.nth(2).locator('input[id*="v-input:monto-"]').fill('2.56');

        const responsePromise = page.waitForResponse(
            (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            {timeout: 30_000}
        );

        await page.getByRole('button', {name: 'Realizar Pago'}).click();

        // Esperar éxito y extraer correlativo de la API
        await expect(page.getByText('¡Buen trabajo!')).toBeVisible({ timeout: 15000 });
        const response = await responsePromise;
        const body = await response.json();
        const correlativoGenerado = String(body.CorrelativoDocumento ?? '');
        if (!correlativoGenerado) throw new Error('No se pudo extraer el correlativo de la respuesta de la API.');

        await page.getByRole('button', {name: 'Nueva Venta'}).click();

        // ── Act & Assert ──────────────────────────────────────────────────────────
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarVentasDeCaja(),
            BuscarComprobanteEnVentas({
                tipoDocumento: 'Boleta',
                correlativo: correlativoGenerado,
            }),
            VerPagoDeComprobante(),
            ValidarModalVerPago('BOLETA', correlativoGenerado)
        );

        // Validar que el modal contenga los métodos ingresados
        await expect(page.locator('.payment-methods')).toContainText('EFECTIVO');
        await expect(page.locator('.payment-methods')).toContainText('VOUCHER');
        await expect(page.locator('.payment-methods')).toContainText('POS VISA');

        await cajero.realiza(CerrarModalVerPago(), BorrarFiltrosVentas(), RegresarANuevaVenta());
    });

    test('validar que venta a crédito NO muestra opción "Ver Pago"', async ({
                                                                                cajero,
                                                                                ventaCreditoFactura,
                                                                            }) => {
        // ── Act ──────────────────────────────────────────────────────────────
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarVentasDeCaja(),
            BuscarComprobanteEnVentas({
                tipoDocumento: 'Factura',
                correlativo: ventaCreditoFactura.correlativo,
            }),
        );

        // ── Assert: "Ver Pago" NO debe estar disponible ───────────────────────
        const verPagoVisible = await cajero.pregunta(VerPagoEsVisible());
        expect(verPagoVisible).toBe(false);

        await cajero.realiza(BorrarFiltrosVentas(), RegresarANuevaVenta());
    });
});
