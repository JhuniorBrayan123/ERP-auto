import { type Page } from '@playwright/test';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';

type TipoSwitch = 'adelanto' | 'detraccion' | 'exportacion' | 'retencion';

export const ToggleSwitch = (tipo: TipoSwitch) => {
    const fn = async (page: Page): Promise<void> => {
        const sliders: Record<TipoSwitch, () => Promise<void>> = {
            adelanto: async () => {
                await FacturacionTargets.sliderAdelanto(page).click();
            },
            detraccion: async () => {
                await FacturacionTargets.sliderDetraccion(page).click({ force: true });
            },
            exportacion: async () => {
                await FacturacionTargets.sliderExportacion(page).click({ force: true });
            },
            retencion: async () => {
                await FacturacionTargets.sliderRetencion(page).click({ force: true });
            },
        };
        await sliders[tipo]();
    };
    fn.displayName = `Activar switch: ${tipo}`;
    return fn;
};

