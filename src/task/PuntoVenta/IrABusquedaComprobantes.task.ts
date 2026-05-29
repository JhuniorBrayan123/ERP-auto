import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '../../pages/PuntoVenta/BusquedaComprobantesPage';

export const IrABusquedaComprobantes = () => {
    const fn = async (page: Page): Promise<void> => {
        const busquedaPage = new BusquedaComprobantesPage(page);
        await busquedaPage.navegarABusquedaComprobantes();
    };
    fn.displayName = 'Ir a Búsqueda de Comprobantes';
    return fn;
};
