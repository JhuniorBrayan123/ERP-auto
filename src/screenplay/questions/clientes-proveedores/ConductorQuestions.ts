import {expect, type Page} from '@playwright/test';
import {ConductoresTargets} from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

export const ConductorVisibleEnListado = (textoEsperado: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ConductoresTargets.tbody(page)).toContainText(textoEsperado);
    };
    fn.displayName = `Conductor visible en listado: ${textoEsperado}`;
    return fn;
};

export const EstadoConductorEnListado = (estado: 'ACTIVO' | 'INACTIVO') => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ConductoresTargets.tbody(page)).toContainText(estado);
    };
    fn.displayName = `Estado conductor en listado: ${estado}`;
    return fn;
};

export const MensajeCreacionConductorExitosaVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ConductoresTargets.mensajeExitoCreacion(page)).toBeVisible({timeout: 10_000});
    };
    fn.displayName = 'Mensaje de creación exitosa visible';
    return fn;
};

export const MensajeEdicionConductorExitosaVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ConductoresTargets.mensajeExitoEdicion(page)).toBeVisible({timeout: 10_000});
    };
    fn.displayName = 'Mensaje de edición exitosa visible';
    return fn;
};

export const MensajeErrorCampoObligatorioConductor = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ConductoresTargets.mensajeCampoObligatorio(page)).toContainText('Campo obligatorio');
    };
    fn.displayName = 'Mensaje de campo obligatorio visible';
    return fn;
};

export const MensajeErrorNumericoDigitos = (cantidadDigitos: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(ConductoresTargets.mensajeDigitos(page)).toContainText(`Debe ingresar ${cantidadDigitos} dígitos`);
    };
    fn.displayName = `Mensaje de error: ${cantidadDigitos} dígitos`;
    return fn;
};

export const BitacoraConductorContieneAccion = (textoAccion: string) => {
    const fn = async (page: Page): Promise<void> => {
        await expect(page.locator('body')).toContainText(textoAccion);
    };
    fn.displayName = `Bitácora contiene acción: ${textoAccion}`;
    return fn;
};

export const MensajeSinGuiasVisible = () => {
    const fn = async (page: Page): Promise<void> => {
        await expect(page.locator('body')).toContainText('NO HAY GUIAS PARA ESTE CONDUCTOR');
    };
    fn.displayName = 'Mensaje NO HAY GUIAS visible';
    return fn;
};
