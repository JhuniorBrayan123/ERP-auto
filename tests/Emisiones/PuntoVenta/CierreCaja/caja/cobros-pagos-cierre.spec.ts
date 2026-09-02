
import { expect } from '@playwright/test';
import { test } from '@fixtures/PuntoVenta/caja.fixture';
import { IrACierreDeCaja } from '@screenplay/tasks/caja/IrACierreDeCaja';
import { IrACobros, RegistrarCobroCliente } from '@screenplay/tasks/caja/IrACobros';
import { RegresarANuevaVenta } from '@screenplay/tasks/caja/AbrirMenuCaja';
import {
    ConsultarCobrosYPagos,
    BuscarCobroEnCierre,
} from '@screenplay/tasks/cierre-caja/ConsultarCobrosYPagos';
import { CobroVisibleEnCierre } from '@screenplay/questions/cierre-caja/MovimientoVisibleEnCierre';
import { UsarNavegador } from '@abilities/usarnavegador';
import {CobrosPagosTargets} from "@screenplay/targets/cierre-caja/CobrosPagosTargets";

test.describe('CC-02 | Cobros y Pagos', {tag: ['@cierre-caja']}, () => {
    test.describe.configure({ mode: 'serial' });

    test('SC-01: Registrar cobro de venta a crédito y verificar reflejo en cierre de caja @CC-02.1', async ({
        cajero,
        ventaCreditoBoleta,
    }) => {
        
        

        
        await cajero.realiza(IrACobros());

        const { idDocFinanciero } = await cajero.realizaYObtiene(
            RegistrarCobroCliente({
                monto: '10.56',
                correlativoComprobante: ventaCreditoBoleta.correlativo,
            }),
        );

        
        const page = cajero.habilidad(UsarNavegador).page;

        await CobrosPagosTargets.opcionCobroPendiente(page).click();
        await CobrosPagosTargets.selectorEstadoCobro(page).click();
        await page.getByText('Todos').nth(1).click();

        await page.locator('.cmp-grid-pc-options-icon').first().click();
        await page.getByText('Ver cobro', { exact: true }).click();

        await expect(page.getByText(/Monto adeudado: S\/ 0\.00/i)).toBeVisible({ timeout: 10_000 });
        await expect(page.getByText(/Monto cobrado: S\//i)).toBeVisible();

        await page.locator('.drape.is-open > .button-close').click();

        
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarCobrosYPagos(),
        );

        const movimiento = await cajero.realizaYObtiene(
            BuscarCobroEnCierre(idDocFinanciero),
        );

        
        expect(movimiento.CorrelativoDocFinanciero).toBeGreaterThan(0);
        expect(movimiento.SerieFinal).toMatch(/RC01/i);

        const cobroVisible = await cajero.pregunta(
            CobroVisibleEnCierre(movimiento),
        );
        expect(cobroVisible).toBe(true);

        await cajero.realiza(RegresarANuevaVenta());
    });

    test('SC-02: Validar que el cobro aparece en la sección Cobros con datos correctos @CC-02.2', async ({
        cajero,
        ventaCreditoFactura,
    }) => {
        
        await cajero.realiza(IrACobros());

        const { idDocFinanciero } = await cajero.realizaYObtiene(
            RegistrarCobroCliente({
                monto: '10.56',
                correlativoComprobante: ventaCreditoFactura.correlativo,
            }),
        );

        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarCobrosYPagos(),
        );

        const movimiento = await cajero.realizaYObtiene(
            BuscarCobroEnCierre(idDocFinanciero),
        );

        
        
        expect(movimiento.IdDocFinanciero).toBe(idDocFinanciero);
        expect(movimiento.CorrelativoDocFinanciero).toBeGreaterThan(0);
        expect(movimiento.SerieFinal).toBeDefined();

        
        if (movimiento.ReceptorRazonSocial) {
            const page = cajero.habilidad(UsarNavegador).page;
            await expect(
                page.getByText(movimiento.ReceptorRazonSocial, { exact: false }),
            ).toBeVisible();
        }

        await cajero.realiza(RegresarANuevaVenta());
    });
});
