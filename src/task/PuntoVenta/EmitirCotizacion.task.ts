import {type Page} from '@playwright/test';
import {CotizacionTargets} from '@screenplay/targets/cotizacion/CotizacionTargets';

export const EmitirCotizacion = () => {
    const fn = async (page: Page): Promise<void> => {
        await CotizacionTargets.btnEmitir(page).click();
    };
    fn.displayName = `Emitir cotización`;
    return fn;
};
