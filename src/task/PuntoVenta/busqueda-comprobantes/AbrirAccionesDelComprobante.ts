import {Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import type {ComprobanteInfo} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

export class AbrirAccionesDelComprobante {
    static de(comprobante: ComprobanteInfo) {
        const fn = async (page: Page) => {
            const busqueda = new BusquedaComprobantesPage(page);
            await busqueda.abrirAccionesDeComprobante(comprobante.numeroCompleto);
        };
        fn.displayName = `Abrir acciones del comprobante ${comprobante.numeroCompleto}`;
        return fn;
    }

    static delPrimero() {
        const fn = async (page: Page) => {
            const busqueda = new BusquedaComprobantesPage(page);
            await busqueda.abrirAccionesDelPrimerComprobante();
        };
        fn.displayName = 'Abrir acciones del primer comprobante';
        return fn;
    }
}
