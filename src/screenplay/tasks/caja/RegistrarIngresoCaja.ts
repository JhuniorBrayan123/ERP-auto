import {expect, type Page} from '@playwright/test';
import {MenuCajaTargets} from '@screenplay/targets/caja/MenuCajaTargets';
import {IngresosEgresosTargets} from '@screenplay/targets/cierre-caja/IngresosEgresosTargets';

export interface DatosIngresoCaja {
        categoria: string;
        monto: string;
        metodoPago: string;
        motivo: string;
        documentoPersona: string;
        textoSelectorPersona: string;
}

export interface ResultadoIngresoCaja {
        concepto: string;
}


export const RegistrarIngresoCaja = (datos: DatosIngresoCaja) => {
    const fn = async (page: Page): Promise<ResultadoIngresoCaja> => {
        await MenuCajaTargets.btnAbrirMenu(page).click();
        await MenuCajaTargets.opcionIngresoDinero(page).click();

        
        
        await page.locator('.v-select-header-form').filter({hasText: 'VENTAS'}).first().click();
        await page.locator('.v-select-form-option').getByText(datos.categoria, {exact: true}).click();

        
        await IngresosEgresosTargets.inputMonto(page).click();
        await IngresosEgresosTargets.inputMonto(page).fill(datos.monto);

        
        
        await page.locator('.v-select-header-form').filter({hasText: 'EFECTIVO'}).first().click();
        await page.locator('.v-select-form-option').getByText(datos.metodoPago, {exact: true}).click();

        
        await IngresosEgresosTargets.inputMotivoIngreso(page).fill(datos.motivo);

        
        await IngresosEgresosTargets.inputBuscarPersona(page).fill(datos.documentoPersona);
        
        await page.locator('article').filter({hasText: datos.textoSelectorPersona}).first().click();

        
        await IngresosEgresosTargets.btnRegistrarIngreso(page).click();

        
        await expect(IngresosEgresosTargets.toastIngresoRegistrado(page)).toBeVisible({timeout: 30_000});

        
        await IngresosEgresosTargets.btnCerrarModal(page).click();

        return {concepto: datos.motivo};
    };

    fn.displayName = `Registrar ingreso de caja: ${datos.categoria} / ${datos.motivo} — S/${datos.monto}`;
    return fn;
};
