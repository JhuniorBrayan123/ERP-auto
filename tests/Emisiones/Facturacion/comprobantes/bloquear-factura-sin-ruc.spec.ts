import {expect, test} from '@fixtures/PuntoVenta/facturacion.fixture';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {BuscarYAgregarProducto} from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {MensajeValidacion} from "@screenplay/questions/facturacion/MensajeValidacion";

test.describe('Facturación — Bloquear factura sin RUC', () => {

    test('Bloquea la emisión de una Factura con cliente DNI (sin RUC)', async ({cajero, page}) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
        );
        await page.getByRole('button', {name: 'PAGAR'}).click();

        await expect(page.locator('body')).toContainText('Selecciona un cliente con RUC para emitir una factura');

        const btnRealizarPago = page.getByRole('button', {name: 'Realizar Pago'});
        const pagoProcesado = await btnRealizarPago.isVisible({timeout: 3_000}).catch(() => false);
        expect(pagoProcesado).toBe(false);
    });
});
