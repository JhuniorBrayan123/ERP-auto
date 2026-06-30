/**
 * Spec: cobros-pagos-cierre.spec.ts
 *
 * Cubre:
 * - Registrar cobro de venta a crédito y verificar reflejo en Cierre de Caja
 * - Verificar que el estado pase a COBRADO y monto adeudado = 0.00
 *
 * Estrategia de captura dinámica:
 * - POST /PuntoVenta/api/v1/cobros/documentos → cobro.Hojas[0].Id = idDocFinanciero
 * - GET /Finanzas/api/v2/cajas/{id}/movimientos → buscar por idDocFinanciero
 * - Sin correlativos hardcodeados
 */

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

test.describe('Cobros y Pagos en Cierre de Caja', () => {
    test.describe.configure({ mode: 'serial' });

    test('registrar cobro de venta a crédito y verificar reflejo en cierre de caja', async ({
        cajero,
        ventaCreditoBoleta,
    }) => {
        // ── Arrange ─────────────────────────────────────────────────────────
        // ventaCreditoBoleta crea una boleta a crédito con deuda pendiente

        // ── Act: ir a Cobros y registrar el cobro ────────────────────────────
        await cajero.realiza(IrACobros());

        const { idDocFinanciero } = await cajero.realizaYObtiene(
            RegistrarCobroCliente({
                monto: '10.56',
                correlativoComprobante: ventaCreditoBoleta.correlativo,
            }),
        );

        // ── Act: verificar "Ver cobro" muestra monto adeudado = 0.00 ─────────
        const page = cajero.habilidad(UsarNavegador).page;

        // Resetear filtros y buscar el cobro
        await page.locator('.cmp-grid-pc-options-icon').first().click();
        await page.getByText('Ver cobro', { exact: true }).click();

        await expect(page.getByText(/Monto adeudado: S\/ 0\.00/i)).toBeVisible({ timeout: 10_000 });
        await expect(page.getByText(/Monto cobrado: S\//i)).toBeVisible();

        await page.locator('.drape.is-open > .button-close').click();

        // ── Act: ir a cierre de caja y buscar el cobro por IdDocFinanciero ───
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarCobrosYPagos(),
        );

        const movimiento = await cajero.realizaYObtiene(
            BuscarCobroEnCierre(idDocFinanciero),
        );

        // ── Assert ───────────────────────────────────────────────────────────
        expect(movimiento.CorrelativoDocFinanciero).toBeGreaterThan(0);
        expect(movimiento.SerieFinal).toMatch(/RC01/i);

        const cobroVisible = await cajero.pregunta(
            CobroVisibleEnCierre(movimiento),
        );
        expect(cobroVisible).toBe(true);

        await cajero.realiza(RegresarANuevaVenta());
    });

    test('validar que el cobro aparece en la sección Cobros con datos correctos', async ({
        cajero,
        ventaCreditoFactura,
    }) => {
        // ── Arrange + Act ────────────────────────────────────────────────────
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

        // ── Assert ───────────────────────────────────────────────────────────
        // El movimiento tiene todos los datos necesarios para trazabilidad
        expect(movimiento.IdDocFinanciero).toBe(idDocFinanciero);
        expect(movimiento.CorrelativoDocFinanciero).toBeGreaterThan(0);
        expect(movimiento.SerieFinal).toBeDefined();

        // Verificar receptor (cliente que pagó)
        if (movimiento.ReceptorRazonSocial) {
            const page = cajero.habilidad(UsarNavegador).page;
            await expect(
                page.getByText(movimiento.ReceptorRazonSocial, { exact: false }),
            ).toBeVisible();
        }

        await cajero.realiza(RegresarANuevaVenta());
    });
});
