import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {EliminarComprobante} from '@task/PuntoVenta/busqueda-comprobantes/EliminarComprobante';

export const EliminarNotaVinculada = (numero: string) => {
    const fn = async (page: Page): Promise<void> => {
        const correlativo = numero.split('-')[1];
        const busqueda = new BusquedaComprobantesPage(page);

        await busqueda.navegarABusquedaComprobantes({serie: '', correlativo, comprobanteId: 0});
        await busqueda.abrirAccionesDeComprobante(numero);
        await EliminarComprobante.conMotivo('Limpieza automatizada de nota vinculada')(page);
    };

    fn.displayName = `Eliminar nota vinculada ${numero} (limpieza automatizada)`;
    return fn;
};
