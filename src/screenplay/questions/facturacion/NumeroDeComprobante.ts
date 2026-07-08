import { type Page } from '@playwright/test';
import { ComprobanteTargets } from '@screenplay/targets/facturacion/ComprobanteTargets';

export const NumeroDeComprobante = () => {
    const fn = async (page: Page): Promise<string> => {
        const regex = ComprobanteTargets.regexNumeroComprobante;
        const locator = page.getByText(regex).last();
        const texto = await locator.innerText({ timeout: 10_000 });
        const match = texto.match(regex);
        return match ? match[0] : '';
    };
    fn.displayName = 'Leer número de comprobante emitido';
    return fn;
};
