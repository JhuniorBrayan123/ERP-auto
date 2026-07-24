import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '../../pages/PuntoVenta/BusquedaComprobantesPage';
import {esperarCargaOverlay} from "@utils/wait-helpers";

export const IrABusquedaComprobantes = () => {
    const fn = async (page: Page): Promise<void> => {
        const busquedaPage = new BusquedaComprobantesPage(page);
        await busquedaPage.navegarABusquedaComprobantes();
        await esperarCargaOverlay(page);
    };
    fn.displayName = 'Ir a Búsqueda de Comprobantes';
    return fn;
};
