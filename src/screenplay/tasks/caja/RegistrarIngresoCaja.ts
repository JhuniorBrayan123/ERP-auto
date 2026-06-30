import {expect, type Page} from '@playwright/test';
import {MenuCajaTargets} from '@screenplay/targets/caja/MenuCajaTargets';
import {IngresosEgresosTargets} from '@screenplay/targets/cierre-caja/IngresosEgresosTargets';

export interface DatosIngresoCaja {
    /** Categoría del ingreso (ej: "INGRESO DE CAPITAL", "DEVOLUCIONES") */
    categoria: string;
    /** Monto del ingreso en soles */
    monto: string;
    /** Método de pago (ej: "EFECTIVO", "CHEQUE") */
    metodoPago: string;
    /** Motivo descriptivo del ingreso */
    motivo: string;
    /** Documento de la persona asociada al ingreso */
    documentoPersona: string;
    /** Texto visible de la persona en el dropdown (para seleccionarla) */
    textoSelectorPersona: string;
}

export interface ResultadoIngresoCaja {
    /** Concepto (motivo) del recibo de ingreso */
    concepto: string;
}

// ─── Task: RegistrarIngresoCaja ───────────────────────────────────────────────
/**
 * Abre el menú lateral, selecciona "Ingreso de dinero", completa el formulario
 * y registra el ingreso. Retorna el motivo que servirá como concepto.
 */
export const RegistrarIngresoCaja = (datos: DatosIngresoCaja) => {
    const fn = async (page: Page): Promise<ResultadoIngresoCaja> => {
        await MenuCajaTargets.btnAbrirMenu(page).click();
        await MenuCajaTargets.opcionIngresoDinero(page).click();

        // Seleccionar categoría (por defecto muestra "VENTAS")
        // Buscamos el selector que contiene "VENTAS" para abrir el de categoría
        await page.locator('.v-select-header-form').filter({hasText: 'VENTAS'}).first().click();
        await page.locator('.v-select-form-option').getByText(datos.categoria, {exact: true}).click();

        // Ingresar monto
        await IngresosEgresosTargets.inputMonto(page).click();
        await IngresosEgresosTargets.inputMonto(page).fill(datos.monto);

        // Seleccionar método de pago (por defecto muestra "EFECTIVO")
        // Buscamos el selector que contiene "EFECTIVO" para abrir el de método de pago
        await page.locator('.v-select-header-form').filter({hasText: 'EFECTIVO'}).first().click();
        await page.locator('.v-select-form-option').getByText(datos.metodoPago, {exact: true}).click();

        // Ingresar motivo
        await IngresosEgresosTargets.inputMotivoIngreso(page).fill(datos.motivo);

        // Seleccionar persona
        await IngresosEgresosTargets.inputBuscarPersona(page).fill(datos.documentoPersona);
        // Esperamos a que aparezca el resultado de búsqueda (que usa la etiqueta <article>)
        await page.locator('article').filter({hasText: datos.textoSelectorPersona}).first().click();

        // Registrar ingreso
        await IngresosEgresosTargets.btnRegistrarIngreso(page).click();

        // Verificar confirmación
        await expect(IngresosEgresosTargets.toastIngresoRegistrado(page)).toBeVisible({timeout: 30_000});

        // Cerrar modal de confirmación
        await IngresosEgresosTargets.btnCerrarModal(page).click();

        return {concepto: datos.motivo};
    };

    fn.displayName = `Registrar ingreso de caja: ${datos.categoria} / ${datos.motivo} — S/${datos.monto}`;
    return fn;
};
