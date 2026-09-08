import { expect, type Page } from '@playwright/test';
import { MenuCajaTargets } from '@screenplay/targets/caja/MenuCajaTargets';
import { IngresosEgresosTargets } from '@screenplay/targets/cierre-caja/IngresosEgresosTargets';
import { esperarCargaOverlaySiVisible } from '@utils/wait-helpers';

export interface DatosEgresoCaja {
        categoria: string;
        monto: string;
        metodoPago: string;
        motivo: string;
        documentoPersona: string;
        textoSelectorPersona: string;
}

export interface ResultadoEgresoCaja {
        concepto: string;
}


export const RegistrarEgresoCaja = (datos: DatosEgresoCaja) => {
    const fn = async (page: Page): Promise<ResultadoEgresoCaja> => {
        await MenuCajaTargets.btnAbrirMenu(page).click();
        await MenuCajaTargets.opcionEgresoDinero(page).click();

        
        await page.locator('.v-select-header-form:visible').nth(0).click();
        await page.locator('.v-select-form-option').getByText(datos.categoria, { exact: true }).click();

        
        await IngresosEgresosTargets.inputMonto(page).click();
        await IngresosEgresosTargets.inputMonto(page).fill(datos.monto);

        
        await page.locator('.v-select-header-form:visible').nth(1).click();
        await page.locator('.v-select-form-option').getByText(datos.metodoPago, { exact: true }).click();

        
        await IngresosEgresosTargets.inputMotivoEgreso(page).fill(datos.motivo);

        
        await IngresosEgresosTargets.inputBuscarPersona(page).fill(datos.documentoPersona);
        await IngresosEgresosTargets.inputBuscarPersona(page).press('Enter');
        await esperarCargaOverlaySiVisible(page).catch(() => {});
        await IngresosEgresosTargets.articulosResultadosPersona(page)
            .filter({ hasText: datos.documentoPersona })
            .first()
            .click();

        
        await IngresosEgresosTargets.btnRegistrarEgreso(page).click();

        
        await expect(IngresosEgresosTargets.toastEgresoRegistrado(page)).toBeVisible({ timeout: 15_000 });

        
        await IngresosEgresosTargets.btnCerrarModal(page).click();

        return { concepto: datos.motivo };
    };

    fn.displayName = `Registrar egreso de caja: ${datos.categoria} / ${datos.motivo} — S/${datos.monto}`;
    return fn;
};
