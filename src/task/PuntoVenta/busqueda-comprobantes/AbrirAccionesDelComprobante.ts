import {Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import type {ComprobanteInfo} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

export class AbrirAccionesDelComprobante {
    static de(comprobante: ComprobanteInfo) {
        const fn = async (page: Page) => {
            const busqueda = new BusquedaComprobantesPage(page);
            await busqueda.abrirAcciones(comprobante);
        };
        fn.displayName = `Abrir acciones del comprobante ${comprobante.numeroCompleto}`;
        return fn;
    }
}
