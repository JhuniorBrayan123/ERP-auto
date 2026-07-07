import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { EmitirFacturaConDetraccion } from '@screenplay/tasks/facturacion/EmitirFacturaConDetraccion';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

const DETRACCION_CHECKBOX_ID = 'pv_punto-venta_cmp-factura-boleta-header_v-switch:documento-detraccion';

const activarDetraccion = async (page: import('@playwright/test').Page): Promise<void> => {
    const isChecked = await page.evaluate((id) => {
        const el = document.getElementById(id) as HTMLInputElement;
        return el?.checked ?? false;
    }, DETRACCION_CHECKBOX_ID);

    if (!isChecked) {
        await page.evaluate((id) => {
            const el = document.getElementById(id) as HTMLInputElement;
            if (el && !el.checked) {
                el.checked = true;
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, DETRACCION_CHECKBOX_ID);
        await page.waitForTimeout(500);
    }
};

test.describe('Facturación — Emitir Factura con Detracción', () => {

    test('Emite Factura con Detracción simple (10% - cuenta estándar)', async ({ cajero }) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirFacturaConDetraccion({
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                productos: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                detraccion: {
                    porcentaje: '10',
                    numeroCuenta: '11282847580',
                },
            })
        );
        expect(resultado.serie).toBe('F001');
        expect(resultado.numero).toMatch(/^F001-\d{8}$/);
    });

    test('Bloquea emisión con Detracción activada sin completar datos obligatorios', async ({ page, cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYSeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
        );

        await activarDetraccion(page);

        await BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL)(page);

        await page.getByRole('button', { name: 'PAGAR' }).click();

        const btnPago = page.getByRole('button', { name: 'Realizar Pago' });
        const pagoVisible = await btnPago.isVisible({ timeout: 3_000 }).catch(() => false);
        expect(pagoVisible).toBe(false);
    });
});
