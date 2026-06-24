import {Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import type {ComprobanteInfo} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

export class BuscarComprobante {
    static porSerieCorrelativo(comprobante: ComprobanteInfo) {
        const fn = async (page: Page) => {
            const busqueda = new BusquedaComprobantesPage(page);
            await busqueda.ir();
            await busqueda.buscarPorSerieCorrelativo(comprobante);
        };
        fn.displayName = `Buscar comprobante ${comprobante.numeroCompleto}`;
        return fn;
    }
}
