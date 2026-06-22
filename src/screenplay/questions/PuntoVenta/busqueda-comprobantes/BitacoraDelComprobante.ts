import {Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import type {ComprobanteInfo} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

export class BitacoraDelComprobante {
    static contieneEventos(comprobante: ComprobanteInfo, eventos: string[]) {
        const fn = async (page: Page): Promise<boolean> => {
            const busqueda = new BusquedaComprobantesPage(page);
            try {
                await busqueda.validarBitacoraContiene(comprobante, eventos);
                return true;
            } catch {
                return false;
            }
        };
        return fn;
    }
}
