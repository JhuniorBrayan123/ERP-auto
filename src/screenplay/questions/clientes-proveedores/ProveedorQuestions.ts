import {expect, type Page} from '@playwright/test';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

export const ProveedorVisibleEnListado = (textoEsperado: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ProveedoresTargets.tbody(page)).toContainText(textoEsperado);
    };
    fn.displayName = `Proveedor visible en listado: ${textoEsperado}`;
    return fn;
};

export const SinResultadosBusqueda = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ProveedoresTargets.tbody(page)).toContainText('NO HAY RESULTADOS');
    };
    fn.displayName = 'Sin resultados de búsqueda';
    return fn;
};

export const EstadoProveedorEnListado = (estado: 'ACTIVO' | 'INACTIVO') => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ProveedoresTargets.tbody(page)).toContainText(estado);
    };
    fn.displayName = `Estado proveedor en listado: ${estado}`;
    return fn;
};

export const MensajeCreacionExitosaVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ProveedoresTargets.mensajeBuenTrabajo(page)).toBeVisible({timeout: 10_000});
        await expect(ProveedoresTargets.mensajeExitoCreacion(page)).toBeVisible();
    };
    fn.displayName = 'Mensaje de creación de proveedor exitosa visible';
    return fn;
};

export const MensajeEdicionExitosaVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ProveedoresTargets.mensajeBuenTrabajo(page)).toBeVisible({timeout: 10_000});
        await expect(ProveedoresTargets.mensajeExitoEdicion(page)).toBeVisible();
    };
    fn.displayName = 'Mensaje de edición exitosa visible';
    return fn;
};

export const MensajeEliminacionExitosaVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ProveedoresTargets.mensajeBuenTrabajo(page)).toBeVisible({timeout: 10_000});
        await expect(ProveedoresTargets.mensajeExitoEliminacion(page)).toBeVisible();
    };
    fn.displayName = 'Mensaje de eliminación exitosa visible';
    return fn;
};

export const MensajeCampoObligatorioVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ProveedoresTargets.mensajeCampoObligatorio(page)).toContainText('Campo obligatorio');
    };
    fn.displayName = 'Mensaje de campo obligatorio visible';
    return fn;
};

export const BitacoraContieneAccion = (textoAccion: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(page.locator('body')).toContainText(textoAccion);
    };
    fn.displayName = `Bitácora contiene acción: ${textoAccion}`;
    return fn;
};
