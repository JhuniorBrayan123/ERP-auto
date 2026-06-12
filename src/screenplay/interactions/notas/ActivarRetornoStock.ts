import {expect, type Page} from '@playwright/test';
import {NotaCreditoTargets} from '../../targets/notas-credito/NotaCreditoTargets';

export const ActivarRetornoStock = () => {
    const fn = async (page: Page): Promise<void> => {
        const slider = NotaCreditoTargets.switchRetornoStock(page);


        const switchInput = page.locator(
            '[id="pv_punto-venta_cmp-nota-credito_cmp-header:header_cmp-motivo-comprobante_v-switch:estado"]'
        );

        const isChecked = await switchInput.isChecked().catch(() => false);

        if (!isChecked) {
            await slider.click();

            await expect(switchInput).toBeChecked({timeout: 5_000});
        }
    };

    fn.displayName = 'Activar retorno de stock';
    return fn;
};

export const DesactivarRetornoStock = () => {
    const fn = async (page: Page): Promise<void> => {
        const slider = NotaCreditoTargets.switchRetornoStock(page);

        const switchInput = page.locator(
            '[id="pv_punto-venta_cmp-nota-credito_cmp-header:header_cmp-motivo-comprobante_v-switch:estado"]'
        );

        const isChecked = await switchInput.isChecked().catch(() => false);

        if (isChecked) {
            await slider.click();
            await expect(switchInput).not.toBeChecked({timeout: 5_000});
        }
    };

    fn.displayName = 'Desactivar retorno de stock';
    return fn;
};
