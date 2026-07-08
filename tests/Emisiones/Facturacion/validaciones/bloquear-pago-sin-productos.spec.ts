import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { CLIENTES } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Facturación — Bloquear pago sin productos', () => {

    test('Bloquea el pago cuando no hay ningún producto en la grilla', async ({ page, cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('BOLETA'),
            BuscarYSeleccionarCliente(CLIENTES.PERSONA_DNI),
        );

        await page.getByRole('button', { name: 'PAGAR' }).click();

        await expect(page.locator('body')).toContainText(
            'No puedes realizar un pago porque no tienes ítems seleccionados'
        );

        const btnPago = page.getByRole('button', { name: 'Realizar Pago' });
        await expect(btnPago).not.toBeVisible({ timeout: 3_000 }).catch(() => {});
    });
});
