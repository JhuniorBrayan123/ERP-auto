import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {EliminarComprobante} from '@task/PuntoVenta/busqueda-comprobantes/EliminarComprobante';

export interface DatosAnulacionNotaVenta {
    correlativo: string;
    numeroCompleto: string;
    motivo: string;
}

/**
 * Navega a Búsqueda de comprobantes filtrando por el correlativo emitido,
 * abre las acciones del comprobante y lo elimina (anula) con el motivo dado.
 */
export const AnularNotaVentaDesdeBusqueda = ({
    correlativo,
    numeroCompleto,
    motivo,
}: DatosAnulacionNotaVenta) => {
    const fn = async (page: Page): Promise<void> => {
        const busqueda = new BusquedaComprobantesPage(page);

        await busqueda.navegarABusquedaComprobantes({serie: '', correlativo, comprobanteId: 0});
        await busqueda.abrirAccionesDeComprobante(numeroCompleto);
        await EliminarComprobante.conMotivo(motivo)(page);
    };

    fn.displayName = `Anular Nota de Venta ${numeroCompleto} desde Búsqueda`;
    return fn;
};