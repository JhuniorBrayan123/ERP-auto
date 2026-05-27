import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

export const AbrirBitacoraComprobante = (correlativo: string) => {
    const fn = async (page: Page): Promise<void> => {
        const busqueda = new BusquedaComprobantesPage(page);
        await busqueda.filtrarPorCorrelativo(correlativo);
        await busqueda.abrirBitacoraDelPrimerComprobante();
    };
    fn.displayName = `Abrir bitácora del comprobante: ${correlativo}`;
    return fn;
};
