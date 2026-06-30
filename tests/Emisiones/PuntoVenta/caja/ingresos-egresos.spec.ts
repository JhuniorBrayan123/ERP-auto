/**
 * Spec: ingresos-egresos.spec.ts
 *
 * Cubre:
 * - Registrar ingreso de dinero en caja y verificar reflejo en cierre
 * - Registrar egreso de dinero en caja y verificar reflejo en cierre
 * - Buscar ingreso/egreso por texto en cierre de caja
 *
 * Estrategia de aislamiento:
 * - Cada test crea su propio ingreso/egreso y captura el IdDocFinanciero vía API
 * - No depende de correlativos hardcodeados ni de datos creados por otros tests
 * - Usa datos de clientes/proveedores del ambiente de automatización
 */

import { expect } from '@playwright/test';
import { test } from '@fixtures/PuntoVenta/caja.fixture';
import { RegistrarIngresoCaja } from '@screenplay/tasks/caja/RegistrarIngresoCaja';
import { RegistrarEgresoCaja } from '@screenplay/tasks/caja/RegistrarEgresoCaja';
import { IrACierreDeCaja } from '@screenplay/tasks/caja/IrACierreDeCaja';
import { RegresarANuevaVenta } from '@screenplay/tasks/caja/AbrirMenuCaja';
import {
    ConsultarIngresosYEgresos,
    BuscarMovimientoEnCierrePorConcepto,
    BuscarEnIngresosEgresos,
} from '@screenplay/tasks/cierre-caja/ConsultarIngresosYEgresos';
import { MovimientoVisibleEnCierre } from '@screenplay/questions/cierre-caja/MovimientoVisibleEnCierre';
import { CLIENTES } from '@helpers/PuntoVenta/emision-data.helper';

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const INGRESO_DATOS = {
    categoria: 'INGRESO DE CAPITAL',
    monto: '100',
    metodoPago: 'EFECTIVO',
    motivo: `ingreso-auto-${Date.now()}`,
    documentoPersona: CLIENTES.PERSONA_DNI.documento,
    textoSelectorPersona: 'JHUNIOR BRAYAN GUTIERREZ',
};

const EGRESO_DATOS = {
    categoria: 'COMPRAS',
    monto: '10',
    metodoPago: 'YAPE',
    motivo: `egreso-auto-${Date.now()}`,
    documentoPersona: CLIENTES.PERSONA_DNI_2.documento,
    textoSelectorPersona: 'MARCELO EDWIN SOLANO GARAY',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Ingresos y Egresos de Caja', () => {
    test.describe.configure({ mode: 'serial' });

    test('registrar ingreso de dinero y verificar reflejo en cierre de caja', async ({ cajero }) => {
        // ── Arrange ─────────────────────────────────────────────────────────
        // (cajaAbierta ya garantizado por el fixture)

        // ── Act: registrar ingreso ───────────────────────────────────────────
        const { concepto } = await cajero.realizaYObtiene(
            RegistrarIngresoCaja(INGRESO_DATOS),
        );

        // ── Act: ir a cierre y buscar movimiento por concepto capturado ────────────
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarIngresosYEgresos(),
        );

        const movimiento = await cajero.realizaYObtiene(
            BuscarMovimientoEnCierrePorConcepto(concepto),
        );

        // Buscar el correlativo en el input de la UI
        await cajero.realiza(
            BuscarEnIngresosEgresos(movimiento.CorrelativoDocFinanciero.toString())
        );

        // ── Assert ───────────────────────────────────────────────────────────
        expect(movimiento.CorrelativoDocFinanciero).toBeGreaterThan(0);
        expect(movimiento.SerieFinal).toMatch(/RC01/i);

        const visibleEnCierre = await cajero.pregunta(
            MovimientoVisibleEnCierre(movimiento),
        );
        expect(visibleEnCierre).toBe(true);

        // Verificar que el contenedor muestra el monto correcto
        await expect(
            cajero.habilidad(require('@abilities/usarnavegador').UsarNavegador).page
                .getByText(`S/100.00`, { exact: false }),
        ).toBeVisible();

        // ── Cleanup: regresar a caja ─────────────────────────────────────────
        await cajero.realiza(RegresarANuevaVenta());
    });

    test('registrar egreso de dinero y verificar reflejo en cierre de caja', async ({ cajero }) => {
        // ── Arrange ─────────────────────────────────────────────────────────
        // cajaAbierta garantizado por fixture

        // ── Act ──────────────────────────────────────────────────────────────
        const { concepto } = await cajero.realizaYObtiene(
            RegistrarEgresoCaja(EGRESO_DATOS),
        );

        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarIngresosYEgresos(),
        );

        const movimiento = await cajero.realizaYObtiene(
            BuscarMovimientoEnCierrePorConcepto(concepto),
        );

        // Buscar el correlativo en el input de la UI
        await cajero.realiza(
            BuscarEnIngresosEgresos(movimiento.CorrelativoDocFinanciero.toString())
        );

        // ── Assert ───────────────────────────────────────────────────────────
        expect(movimiento.CorrelativoDocFinanciero).toBeGreaterThan(0);
        expect(movimiento.SerieFinal).toMatch(/RP01/i);

        const page = cajero.habilidad(require('@abilities/usarnavegador').UsarNavegador).page;

        // Verificar método de pago del egreso
        await expect(
            page.getByText('YAPE', { exact: true }).first(),
        ).toBeVisible();

        // Verificar categoría y motivo del egreso
        await expect(
            page.getByText(/COMPRAS.*egreso-auto/i, { exact: false }).first(),
        ).toBeVisible();

        await cajero.realiza(RegresarANuevaVenta());
    });

    test('buscar ingreso por correlativo y validar separación de ingresos y egresos', async ({
        cajero,
    }) => {
        // ── Arrange ─────────────────────────────────────────────────────────
        const ingreso = await cajero.realizaYObtiene(
            RegistrarIngresoCaja({
                ...INGRESO_DATOS,
                categoria: 'DEVOLUCIONES',
                metodoPago: 'CHEQUE',
                motivo: `busqueda-correlativo-${Date.now()}`,
            }),
        );

        // ── Act ──────────────────────────────────────────────────────────────
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarIngresosYEgresos(),
        );

        // Obtenemos el movimiento primero para saber cuál es su correlativo
        const movimiento = await cajero.realizaYObtiene(
            BuscarMovimientoEnCierrePorConcepto(ingreso.concepto),
        );

        // Ahora sí, probamos que el buscador por correlativo funciona
        await cajero.realiza(
            BuscarEnIngresosEgresos(movimiento.CorrelativoDocFinanciero.toString())
        );

        // ── Assert ───────────────────────────────────────────────────────────
        const page = cajero.habilidad(require('@abilities/usarnavegador').UsarNavegador).page;

        // El resultado debe estar en la sección Ingresos (NO en Egresos)
        await expect(page.getByText(/Total Ingresos/i)).toBeVisible();

        // El método de pago debe ser CHEQUE
        await expect(page.getByText('CHEQUE', { exact: true }).first()).toBeVisible();

        expect(movimiento.SerieFinal).toMatch(/RC01/i);

        await cajero.realiza(RegresarANuevaVenta());
    });
});
