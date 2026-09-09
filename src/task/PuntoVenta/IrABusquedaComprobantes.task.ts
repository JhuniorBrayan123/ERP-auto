import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/busqueda-comprobantes';
import {esperarCargaOverlay} from "@utils/wait-helpers";
import {esperarCargaGrillaComprobantes} from '@pages/PuntoVenta/busqueda-comprobantes/wait-helpers';

export const IrABusquedaComprobantes = () => {
    const fn = async (page: Page): Promise<void> => {
        const busquedaPage = new BusquedaComprobantesPage(page);
        await busquedaPage.ir();
        await esperarCargaOverlay(page);
        await esperarCargaGrillaComprobantes(page);
    };
    fn.displayName = 'Ir a Búsqueda de Comprobantes';
    return fn;
};
