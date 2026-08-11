import { type Page } from '@playwright/test';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';

export const VistaFacturacionActiva = () => {
    const fn = async (page: Page): Promise<boolean> => {
        return await FacturacionTargets.iconoVistaFacturacionActivo(page)
            .isVisible({ timeout: 3_000 })
            .catch(() => false);
    };
    fn.displayName = '¿Vista Facturación está activa?';
    return fn;
};
