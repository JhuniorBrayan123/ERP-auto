import { type Page } from '@playwright/test';
import { VendedoresTargets } from '@screenplay/targets/clientes-proveedores/VendedoresTargets';
import { expect } from '@playwright/test';

export const BuscarVendedorEnListado = (textoBusqueda: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = VendedoresTargets.inputBuscar(page);
        await input.click();
        await input.fill('');
        await input.fill(textoBusqueda);

        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
    };
    fn.displayName = `Buscar vendedor: ${textoBusqueda}`;
    return fn;
};

export const AbrirAccionContextualVendedor = (
    accion:
        | 'Editar vendedor'
        | 'Ver bitácora'
        | 'Desactivar vendedor'
        | 'Activar vendedor'
        | 'Eliminar vendedor'
) => {
    const fn = async (page: Page): Promise<void> => {
        await VendedoresTargets.botonContextualVendedor(page).click();

        if (accion === 'Editar vendedor') {
            await VendedoresTargets.opcionEditarVendedor(page).click();
        }

        if (accion === 'Ver bitácora') {
            await VendedoresTargets.opcionVerBitacora(page).click();
        }

        if (accion === 'Eliminar vendedor') {
            await VendedoresTargets.opcionEliminarVendedor(page).click();
        }

        if (
            accion === 'Desactivar vendedor' ||
            accion === 'Activar vendedor'
        ) {
            const checkbox = page.locator(
                'input[id="pv_vendedores_cmp-grid-options:opciones_vendedor_cmp-dropdown:options-li:desactivar-vendedor"]'
            );

            const slider = page.locator(
                'label:has(input[id="pv_vendedores_cmp-grid-options:opciones_vendedor_cmp-dropdown:options-li:desactivar-vendedor"]) .slider.round'
            );

            const estaActivo = await checkbox.isChecked();

            if (accion === 'Desactivar vendedor' && estaActivo) {
                await slider.click();
                await expect(checkbox).not.toBeChecked();
            }

            if (accion === 'Activar vendedor' && !estaActivo) {
                await slider.click();
                await expect(checkbox).toBeChecked();
            }
        }
        await page.waitForLoadState('networkidle');
    };

    fn.displayName = `Acción contextual (Vendedor): ${accion}`;

    return fn;
};

export const ValidarVendedorVisible = (texto: string) => {
    const fn = async (page: Page): Promise<boolean> => {
        return await VendedoresTargets.tbody(page)
            .getByText(texto, { exact: false })
            .isVisible({ timeout: 5_000 })
            .catch(() => false);
    };
    fn.displayName = `Validar vendedor visible en listado: ${texto}`;
    return fn;
};

export const ValidarSinResultados = () => {
    const fn = async (page: Page): Promise<boolean> => {
        const rows = await VendedoresTargets.tbody(page).locator('tr').count();
        return rows === 0;
    };
    fn.displayName = 'Validar que no hay resultados (vendedor)';
    return fn;
};
