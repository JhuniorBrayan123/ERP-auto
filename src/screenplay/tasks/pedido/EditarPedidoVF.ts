import { expect, type Page } from '@playwright/test';
import { PedidoTargets } from '@screenplay/targets/pedido/PedidoTargets';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { esperarCargaOverlay } from '@utils/wait-helpers';
import type { ItemVenta } from '@app-types/emision.types';

export interface DatosEdicionPedido {
    correlativo: string;
    nuevosItems?: ItemVenta[];
}

export const EditarPedidoVF = (datos: DatosEdicionPedido) => {
    const fn = async (page: Page): Promise<void> => {
        // 1. Buscar pedido por correlativo
        await esperarCargaOverlay(page).catch(() => {});
        const inputCorrelativo = PedidoTargets.inputCorrelativo(page);
        await inputCorrelativo.click();
        await inputCorrelativo.fill(datos.correlativo);
        await PedidoTargets.btnBuscar(page).click();
        await esperarCargaOverlay(page).catch(() => {});

        // 2. Agregar nuevos items si hay
        if (datos.nuevosItems) {
            for (const item of datos.nuevosItems) {
                await BuscarYAgregarProducto(item)(page);
            }
        }

        // 3. Click Actualizar
        await PedidoTargets.btnActualizarPedido(page).click();
        
        // 4. Validar éxito
        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible({ timeout: 15_000 });
    };

    fn.displayName = `Editar Pedido VF — Correlativo: ${datos.correlativo}`;
    return fn;
};
