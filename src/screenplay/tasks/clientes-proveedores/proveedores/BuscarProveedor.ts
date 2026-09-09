import {type Page} from '@playwright/test';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';
import {esperarCargaOverlay} from '@utils/wait-helpers';

export const BuscarProveedorEnListado = (criterio: string) => {
    const fn = async (page: Page): Promise<void> => {
        const input = ProveedoresTargets.inputBuscar(page);
        await input.click();
        await input.fill(criterio);
        await page.keyboard.press('Enter');
        await esperarCargaOverlay(page).catch(() => {});
    };
    fn.displayName = `Buscar proveedor por: ${criterio}`;
    return fn;
};

export const AbrirAccionContextualProveedor = (accion: string) => {
    const fn = async (page: Page): Promise<void> => {
        await ProveedoresTargets.botonContextualProveedor(page).click();
        await page.getByText(accion).click();
    };
    fn.displayName = `Abrir acción contextual: ${accion}`;
    return fn;
};

export const ValidarProveedorVisible = (texto: string) => {
    const fn = async (page: Page): Promise<boolean> => {
        return await ProveedoresTargets.tbody(page)
            .getByText(texto, {exact: false})
            .isVisible({timeout: 5_000})
            .catch(() => false);
    };
    fn.displayName = `Validar proveedor visible en listado: ${texto}`;
    return fn;
};

export const ValidarSinResultados = () => {
    const fn = async (page: Page): Promise<boolean> => {
        return await page.getByText('NO HAY RESULTADOS PARA TU BÚSQUEDA')
            .isVisible({timeout: 10_000})
            .catch(() => false);
    };
    fn.displayName = 'Validar que no hay resultados (proveedor)';
    return fn;
};
