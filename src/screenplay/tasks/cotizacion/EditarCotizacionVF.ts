import { expect, type Page } from '@playwright/test';
import { BuscarCotizacionPorCorrelativo } from '@screenplay/interactions/cotizacion/BuscarCotizacionPorCorrelativo';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { CotizacionTargets } from '@screenplay/targets/cotizacion/CotizacionTargets';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import type { ItemVenta } from '@app-types/emision.types';

export interface DatosEdicionCotizacion {
    correlativo: string;
    nuevosItems?: ItemVenta[];
    nuevoIGV?: string;
}

export const EditarCotizacionVF = (datos: DatosEdicionCotizacion) => {
    const fn = async (page: Page): Promise<void> => {
        
        await BuscarCotizacionPorCorrelativo(datos.correlativo)(page);

        
        if (datos.nuevosItems) {
            for (const item of datos.nuevosItems) {
                await BuscarYAgregarProducto(item)(page);
            }
        }

        
        if (datos.nuevoIGV) {
            await CotizacionTargets.selectorIGV(page).click();
            await CotizacionTargets.opcionIGV(page, datos.nuevoIGV).click();
        }

        
        await CotizacionTargets.btnActualizarCotizacion(page).click();
        
        
        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible({ timeout: 15_000 });
    };

    fn.displayName = `Editar Cotización VF — Correlativo: ${datos.correlativo}`;
    return fn;
};
