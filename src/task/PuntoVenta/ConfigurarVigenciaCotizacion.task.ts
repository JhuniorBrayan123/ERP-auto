import { type Page } from '@playwright/test';
import { CotizacionOpcionesPage } from '@pages/PuntoVenta/CotizacionOpcionesPage';

export const ConfigurarVigenciaCotizacion = (dias: string) => {
    const fn = async (page: Page): Promise<void> => {
        const opcionesPage = new CotizacionOpcionesPage(page);
        await opcionesPage.seleccionarVigencia(dias);
    };
    fn.displayName = `Configurar vigencia cotización: ${dias}`;
    return fn;
};
