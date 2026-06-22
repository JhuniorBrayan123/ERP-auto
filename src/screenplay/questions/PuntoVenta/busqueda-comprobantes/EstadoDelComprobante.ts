import {Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import type {ComprobanteInfo} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

export class EstadoDelComprobante {
    static enGrilla(comprobante: ComprobanteInfo) {
        const fn = async (page: Page): Promise<string> => {
            const busqueda = new BusquedaComprobantesPage(page);
            // El locator textContent devuelve el string del estado
            return (await busqueda.estadoDe(comprobante).textContent())?.trim() ?? '';
        };
        return fn;
    }
}
