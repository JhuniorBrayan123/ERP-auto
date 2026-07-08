import { type Page } from '@playwright/test';

export interface DatosOpcionales {
    ordenCompra?: string;
    guiaRemision?: string;
    observaciones?: string;
}

export const RegistrarDatosOpcionales = (datos: DatosOpcionales) => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByRole('button', { name: 'Datos opcionales' }).click();

        if (datos.ordenCompra !== undefined) {
            const inputOC = page.getByRole('textbox', { name: 'Orden de compra' });
            if (await inputOC.isVisible({ timeout: 3_000 }).catch(() => false)) {
                await inputOC.fill(datos.ordenCompra);
            }
        }
        if (datos.guiaRemision !== undefined) {
            const inputGuia = page.getByRole('textbox', { name: 'Guía de remisión' });
            if (await inputGuia.isVisible({ timeout: 3_000 }).catch(() => false)) {
                await inputGuia.fill(datos.guiaRemision);
            }
        }
        if (datos.observaciones !== undefined) {
            const inputObs = page.getByRole('textbox', { name: 'Observaciones' });
            if (await inputObs.isVisible({ timeout: 3_000 }).catch(() => false)) {
                await inputObs.fill(datos.observaciones);
            }
        }

        
        await page.locator('.drape.is-open > .button-close').first().click();
    };
    fn.displayName = 'Registrar datos opcionales en comprobante';
    return fn;
};
