import {expect, type Page} from '@playwright/test';
import {PosTargets} from '@screenplay/targets/cross-modules/PosTargets';

export const SeleccionarPersonaEnCaja = (documento: string) => {
    const fn = async (page: Page): Promise<void> => {
        const opcion = PosTargets.opcionDropdownPersona(page, documento);
        await expect(opcion).toBeVisible({timeout: 10_000});
        await opcion.click();
    };
    fn.displayName = `Seleccionar persona en caja: ${documento}`;
    return fn;
};