import {expect, type Page} from '@playwright/test';
import {VendedoresTargets} from '@screenplay/targets/clientes-proveedores/VendedoresTargets';

export const VendedorVisibleEnListado = (textoEsperado: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(VendedoresTargets.tbody(page)).toContainText(textoEsperado);
    };
    fn.displayName = `Vendedor visible en listado: ${textoEsperado}`;
    return fn;
};

export const EstadoVendedorEnListado = (estado: 'ACTIVO' | 'INACTIVO') => {
    const fn = async (page: Page): Promise<void> => {
        await expect(VendedoresTargets.tbody(page)).toContainText(estado);
    };
    fn.displayName = `Estado vendedor en listado: ${estado}`;
    return fn;
};

export const MensajeCreacionVendedorExitosaVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(VendedoresTargets.mensajeExitoCreacion(page)).toBeVisible({timeout: 10_000});
    };
    fn.displayName = 'Mensaje de creación exitosa visible';
    return fn;
};

export const MensajeEdicionVendedorExitosaVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(VendedoresTargets.mensajeExitoEdicion(page)).toBeVisible({timeout: 10_000});
    };
    fn.displayName = 'Mensaje de edición exitosa visible';
    return fn;
};

export const MensajeErrorCampoObligatorioVendedor = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(VendedoresTargets.mensajeCampoObligatorio(page)).toContainText('Campo obligatorio');
    };
    fn.displayName = 'Mensaje de campo obligatorio visible';
    return fn;
};

export const MensajeErrorNumericoDigitos = (cantidadDigitos: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(VendedoresTargets.mensajeDigitos(page)).toContainText(`Debe ingresar ${cantidadDigitos} dígitos`);
    };
    fn.displayName = `Mensaje de error: ${cantidadDigitos} dígitos`;
    return fn;
};

export const BitacoraVendedorContieneAccion = (textoAccion: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(page.locator('body')).toContainText(textoAccion);
    };
    fn.displayName = `Bitácora contiene acción: ${textoAccion}`;
    return fn;
};
