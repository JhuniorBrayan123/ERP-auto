import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/busqueda-comprobantes';
import {esperarCargaOverlaySiVisible} from "@utils/wait-helpers";

export const IrABusquedaComprobantes = () => {
    const fn = async (page: Page): Promise<void> => {
        const busquedaPage = new BusquedaComprobantesPage(page);
        await busquedaPage.ir();
        await esperarCargaOverlaySiVisible(page);
    };
    fn.displayName = 'Ir a Búsqueda de Comprobantes';
    return fn;
};
