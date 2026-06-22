import {Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

export class AccionDelComprobante {
    static esVisible(accion: string) {
        const fn = async (page: Page): Promise<boolean> => {
            const busqueda = new BusquedaComprobantesPage(page);
            try {
                await busqueda.validarAccionVisible(accion);
                return true;
            } catch {
                return false;
            }
        };
        return fn;
    }

    static esOculta(accion: string) {
        const fn = async (page: Page): Promise<boolean> => {
            const busqueda = new BusquedaComprobantesPage(page);
            try {
                await busqueda.validarAccionOculta(accion);
                return true;
            } catch {
                return false;
            }
        };
        return fn;
    }
}
