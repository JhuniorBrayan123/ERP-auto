import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {EliminarComprobante} from '@task/PuntoVenta/busqueda-comprobantes/EliminarComprobante';
import {ClickNuevaVenta} from '@interactions/PuntoVenta/ClickNuevaVenta';

export interface DatosEliminacionNotaVinculada {
    correlativo: string;
    numeroCompleto: string;
}

export const EliminarNotaVinculada = ({
    correlativo,
    numeroCompleto,
}: DatosEliminacionNotaVinculada) => {
    const fn = async (page: Page): Promise<void> => {
        const busqueda = new BusquedaComprobantesPage(page);

        await ClickNuevaVenta()(page);
        await busqueda.navegarABusquedaComprobantes({serie: '', correlativo, comprobanteId: 0});
        await busqueda.abrirAccionesDeComprobante(numeroCompleto);
        await EliminarComprobante.conMotivo('Limpieza automatizada de nota vinculada')(page);
    };

    fn.displayName = `Eliminar nota vinculada ${numeroCompleto} (limpieza automatizada)`;
    return fn;
};
