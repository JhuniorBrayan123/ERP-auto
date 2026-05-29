import {type Page} from '@playwright/test';

export const SeleccionarFechaAnterior = (diasAtras: number = 5) => {
    const fn = async (page: Page): Promise<void> => {
        const fechaInput = page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-input:fecha"]');
        await fechaInput.click();

        const hoy = new Date();
        const target = new Date(hoy);
        target.setDate(hoy.getDate() - diasAtras);
        const dia = target.getDate();

        await page.getByRole('button').filter({ hasText: new RegExp(`^${dia}$`) }).first().click();
    };
    fn.displayName = `Seleccionar fecha ${diasAtras} días atrás`;
    return fn;
};
