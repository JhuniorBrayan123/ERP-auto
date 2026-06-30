import { expect, type Page } from '@playwright/test';
import { MenuCajaTargets } from '@screenplay/targets/caja/MenuCajaTargets';
import { IngresosEgresosTargets } from '@screenplay/targets/cierre-caja/IngresosEgresosTargets';

export interface DatosEgresoCaja {
    /** Categoría del egreso (ej: "COMPRAS", "GASTOS GENERALES") */
    categoria: string;
    /** Monto del egreso en soles */
    monto: string;
    /** Método de pago (ej: "EFECTIVO", "YAPE") */
    metodoPago: string;
    /** Motivo descriptivo del egreso */
    motivo: string;
    /** Documento de la persona/proveedor asociado */
    documentoPersona: string;
    /** Texto visible de la persona en el dropdown */
    textoSelectorPersona: string;
}

export interface ResultadoEgresoCaja {
    /** Concepto (motivo) del recibo de egreso */
    concepto: string;
}

// ─── Task: RegistrarEgresoCaja ────────────────────────────────────────────────
/**
 * Abre el menú lateral, selecciona "Egreso de dinero", completa el formulario
 * y registra el egreso. Retorna el motivo que servirá como concepto.
 */
export const RegistrarEgresoCaja = (datos: DatosEgresoCaja) => {
    const fn = async (page: Page): Promise<ResultadoEgresoCaja> => {
        await MenuCajaTargets.btnAbrirMenu(page).click();
        await MenuCajaTargets.opcionEgresoDinero(page).click();

        // Seleccionar categoría (primer dropdown visible en el modal)
        await page.locator('.v-select-header-form:visible').nth(0).click();
        await page.locator('.v-select-form-option').getByText(datos.categoria, { exact: true }).click();

        // Ingresar monto
        await IngresosEgresosTargets.inputMonto(page).click();
        await IngresosEgresosTargets.inputMonto(page).fill(datos.monto);

        // Seleccionar método de pago (segundo dropdown visible)
        await page.locator('.v-select-header-form:visible').nth(1).click();
        await page.locator('.v-select-form-option').getByText(datos.metodoPago, { exact: true }).click();

        // Ingresar motivo
        await IngresosEgresosTargets.inputMotivoEgreso(page).fill(datos.motivo);

        // Seleccionar persona/proveedor
        await IngresosEgresosTargets.inputBuscarPersona(page).fill(datos.documentoPersona);
        // Esperamos a que aparezca el resultado de búsqueda (que usa la etiqueta <article>)
        await page.locator('article').filter({ hasText: datos.textoSelectorPersona }).first().click();

        // Registrar egreso
        await IngresosEgresosTargets.btnRegistrarEgreso(page).click();

        // Verificar confirmación
        await expect(IngresosEgresosTargets.toastEgresoRegistrado(page)).toBeVisible({ timeout: 15_000 });

        // Cerrar modal de confirmación
        await IngresosEgresosTargets.btnCerrarModal(page).click();

        return { concepto: datos.motivo };
    };

    fn.displayName = `Registrar egreso de caja: ${datos.categoria} / ${datos.motivo} — S/${datos.monto}`;
    return fn;
};
