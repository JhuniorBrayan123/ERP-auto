import { expect, type Page } from '@playwright/test';
import { esperarDebounce } from '@utils/wait-helpers';
import { VentaGridTargets } from '@screenplay/targets/facturacion/VentaGridTargets';

export const BuscarYAgregarProducto = (producto: { codigo: string; nombre: string }) => {
    const fn = async (page: Page): Promise<void> => {
        const input = VentaGridTargets.inputBuscarProducto(page);
        
        await expect(input).toBeVisible({ timeout: 10_000 });
        await input.click();
        await input.fill(producto.codigo);
        
        await esperarDebounce(page, 800, 'Debounce buscador producto Vista Facturación');
        
        const opcion = page.getByText(producto.nombre, { exact: true }).first().or(
            page.getByText(producto.nombre).first()
        );
        
        await expect(opcion).toBeVisible({ timeout: 10_000 });
        await opcion.click();
        
        await esperarDebounce(page, 800, 'Debounce agregar ítem al carrito');
    };
    fn.displayName = `Agregar producto: ${producto.nombre} (${producto.codigo})`;
    return fn;
};
