import {expect, type Page} from '@playwright/test';

export function buscarTasks<T extends Record<string, Function>>(T: T) {

    const BuscarPorDocumento = (criterio: string) => {
        const fn = async (page: Page): Promise<void> => {
            const input = T.inputBuscar(page);
            await input.click();
            await input.fill(criterio);
        };
        fn.displayName = `Buscar por documento: ${criterio}`;
        return fn;
    };

    const ValidarVisibleEnListado = (texto: string) => {
        const fn = async (page: Page): Promise<void> => {
            await expect(T.tbody(page)).toContainText(texto);
        };
        fn.displayName = `Validar entidad visible en listado: ${texto}`;
        return fn;
    };

    const ValidarSinResultados = () => {
        const fn = async (page: Page): Promise<void> => {
            await expect(T.celdaSinResultados(page)).toBeVisible();
        };
        fn.displayName = 'Validar que no hay resultados';
        return fn;
    };

    const AbrirAccionContextual = (accion: string) => {
        const fn = async (page: Page): Promise<void> => {
            await T.botonContextual(page).click();
            await page.getByText(accion).click();
        };
        fn.displayName = `Abrir acción contextual: ${accion}`;
        return fn;
    };

    const AbrirAccionYEsperarDrape = (accion: string) => {
        const fn = async (page: Page): Promise<void> => {
            await T.botonContextual(page).click();
            await page.getByText(accion).click();
            await T.btnCerrarDrape(page).waitFor({state: 'visible', timeout: 10_000}).catch(() => {});
        };
        fn.displayName = `Abrir acción (con drape): ${accion}`;
        return fn;
    };

    return {
        BuscarPorDocumento,
        ValidarVisibleEnListado,
        ValidarSinResultados,
        AbrirAccionContextual,
        AbrirAccionYEsperarDrape,
    };
}
