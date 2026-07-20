import {type Page} from '@playwright/test';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

export const BuscarProveedorEnListado = (textoBusqueda: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ProveedoresTargets.inputBuscar(page);
        await input.click();
        await input.fill('');
        await input.fill(textoBusqueda);
        
        // Simular Enter u otro evento para gatillar la búsqueda, o un pequeño delay para el debounce
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000); // Pequeño debounce si es necesario
    };
    fn.displayName = `Buscar proveedor: ${textoBusqueda}`;
    return fn;
};

export const AbrirAccionContextualProveedor = (accion: 'Editar proveedor' | 'Ver bitácora' | 'Desactivar proveedor' | 'Activar proveedor' | 'Eliminar proveedor') => {
    const fn = async (page: Page): Promise<void> => {
        // Asume que la fila correcta ya está visible (usualmente tras una búsqueda)
        // Hacemos click en el primer botón de opciones de la lista
        await page.locator('.button-actions').first().click();
        await page.getByText(accion, {exact: true}).click();
    };
    fn.displayName = `Acción contextual: ${accion}`;
    return fn;
};
