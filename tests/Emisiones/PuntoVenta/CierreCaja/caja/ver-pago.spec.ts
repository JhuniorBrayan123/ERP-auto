
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

test.describe('CC-09 | Ver Pago', {tag: ['@cierre-caja']}, () => {
    test.describe.configure({mode: 'serial'});

    test('SC-01: Validar "Ver Pago" para venta con pago único (POS VISA) @CC-09.1', async ({cajero, page}) => {
        
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

    test('SC-02: Validar "Ver Pago" para venta con pago combinado (múltiples métodos) @CC-09.2', async ({cajero, page}) => {
        
        
        const comprobantePage = new ComprobantePage(page);
        const clientePage = new ClientePage(page);
        const emisionPage = new EmisionPage(page);

        
        await comprobantePage.seleccionarTipoComprobante('BOLETA');

        
        await clientePage.buscarCliente(CLIENTES.PERSONA_DNI.documento);
        await clientePage.seleccionarClientePorTexto(CLIENTES.PERSONA_DNI.nombre);

        
        await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
        await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);

        
        await emisionPage.clickPagar();

        
        await page.locator('.switch-monto .slider').click();

        const filasMetodo = page.locator('.metodo');

        
        await filasMetodo.nth(0).getByText('Seleccionar método').click();
        await page.waitForTimeout(300); 
        await page.locator('.v-select-base-options.is-open').getByText('EFECTIVO', { exact: true }).first().click();
        await filasMetodo.nth(0).locator('input[id*="v-input:monto-"]').fill('2.5');

        
        await filasMetodo.nth(1).getByText('Seleccionar método').click();
        await page.waitForTimeout(300);
        await page.locator('.v-select-base-options.is-open').getByText('VOUCHER', { exact: true }).first().click();
        await filasMetodo.nth(1).locator('input[id*="v-input:numero-operacion-"]').fill('32');
        await filasMetodo.nth(1).locator('input[id*="v-input:monto-"]').fill('5.5');

        
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

        
        await expect(page.getByText('¡Buen trabajo!')).toBeVisible({ timeout: 15000 });
        const response = await responsePromise;
        const body = await response.json();
        const correlativoGenerado = String(body.CorrelativoDocumento ?? '');
        if (!correlativoGenerado) throw new Error('No se pudo extraer el correlativo de la respuesta de la API.');

        await page.getByRole('button', {name: 'Nueva Venta'}).click();

        
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

        
        await expect(page.locator('.payment-methods')).toContainText('EFECTIVO');
        await expect(page.locator('.payment-methods')).toContainText('VOUCHER');
        await expect(page.locator('.payment-methods')).toContainText('POS VISA');

        await cajero.realiza(CerrarModalVerPago(), BorrarFiltrosVentas(), RegresarANuevaVenta());
    });

    test('SC-03: Validar que venta a crédito NO muestra opción "Ver Pago" @CC-09.3', async ({
                                                                                cajero,
                                                                                ventaCreditoFactura,
                                                                            }) => {
        
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarVentasDeCaja(),
            BuscarComprobanteEnVentas({
                tipoDocumento: 'Factura',
                correlativo: ventaCreditoFactura.correlativo,
            }),
        );

        
        const verPagoVisible = await cajero.pregunta(VerPagoEsVisible());
        expect(verPagoVisible).toBe(false);

        await cajero.realiza(BorrarFiltrosVentas(), RegresarANuevaVenta());
    });
});
