/**
 * Spec: menu-caja.spec.ts
 *
 * Cubre:
 * - Apertura del menú lateral de caja
 * - Visualización de opciones: Ingreso, Egreso, Pagos, Cobros
 * - Opciones de comprobantes disponibles
 * - Verificación del estado de caja abierta
 */

import { expect } from '@playwright/test';
import { test } from '@fixtures/PuntoVenta/caja.fixture';
import { AbrirMenuCaja, RegresarANuevaVenta } from '@screenplay/tasks/caja/AbrirMenuCaja';
import { MenuCajaTargets } from '@screenplay/targets/caja/MenuCajaTargets';
import { UsarNavegador } from '@abilities/usarnavegador';

test.describe('Menú lateral de Caja', () => {

    test('validar apertura del menú lateral y opciones de movimientos de dinero', async ({ cajero }) => {
        // ── Act ──────────────────────────────────────────────────────────────
        await cajero.realiza(AbrirMenuCaja());

        // ── Assert ───────────────────────────────────────────────────────────
        const page = cajero.habilidad(UsarNavegador).page;

        await expect(MenuCajaTargets.opcionIngresoDinero(page)).toContainText('Ingreso de dinero');
        await expect(MenuCajaTargets.opcionEgresoDinero(page)).toContainText('Egreso de dinero');
        await expect(MenuCajaTargets.opcionPagos(page)).toContainText('Pagos');
        await expect(MenuCajaTargets.opcionCobros(page)).toContainText('Cobros');

        // ── Cleanup ───────────────────────────────────────────────────────────
        await cajero.realiza(RegresarANuevaVenta());
    });

    test('validar opciones de comprobantes y módulos disponibles en el menú', async ({ cajero }) => {
        // ── Act ──────────────────────────────────────────────────────────────
        await cajero.realiza(AbrirMenuCaja());

        // ── Assert ───────────────────────────────────────────────────────────
        const page = cajero.habilidad(UsarNavegador).page;

        await expect(page.locator('body')).toContainText('Nueva venta');
        await expect(page.locator('body')).toContainText('Cierre de caja');
        await expect(page.locator('body')).toContainText('Búsqueda de comprobantes');
        await expect(page.locator('body')).toContainText('Anular comprobante');
        await expect(page.locator('body')).toContainText('Nota de Débito');
        await expect(page.locator('body')).toContainText('Nota de Crédito');

        // ── Cleanup ───────────────────────────────────────────────────────────
        await cajero.realiza(RegresarANuevaVenta());
    });
});
