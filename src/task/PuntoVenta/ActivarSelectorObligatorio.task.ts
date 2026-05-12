// 📁 src/task/PuntoVenta/ActivarSelectorObligatorio.task.ts
// SC-14 setup: Navega a Productos → edita item → activa switch Obligatorio (idempotente)
import { Page } from '@playwright/test';

export const ActivarSelectorObligatorio = (codigoItem: string) =>
    async (page: Page): Promise<void> => {
        // Navegar a Productos y servicios
        await page.getByText('Ventas y comprasProductos y').click();
        await page.getByText('Productos y servicios').click();
        await page.locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]').click();
        // Buscar el item
        const buscador = page.getByRole('textbox', { name: 'Buscar por nombre, código o c' });
        await buscador.click();
        await buscador.fill(codigoItem);
        // Abrir edición del item
        await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').click();
        await page.locator('[id="lgt_items_cmp-grid-options:opciones_items_cmp-dropdown:options-li:edicion-item"]').click();
        // Ir a Opciones avanzadas → Selectores
        await page.getByText('Opciones avanzadas (opcional)').click();
        await page.locator('div').filter({ hasText: /^Selectores\(Opcional\)$/ }).first().click();
        // Activar switch Obligatorio (idempotente: si ya está activo no cambia nada)
        await page.locator('.obligatorio > div > .v-switch > .switch-content > .switch > .slider').click();
        // Guardar cambios
        await page.getByRole('button', { name: 'Actualizar producto' }).click();
        await page.locator('.v-modal > div').first().click();
    };
