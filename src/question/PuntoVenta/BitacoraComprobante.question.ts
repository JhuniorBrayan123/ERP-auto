import { type Page } from '@playwright/test';
import { BusquedaComprobantesPage } from '@pages/PuntoVenta/BusquedaComprobantesPage';

export const BitacoraComprobante = {
    noMuestraDescargoInventario: () => {
        return async (page: Page): Promise<boolean> => {
            const busquedaPage = new BusquedaComprobantesPage(page);
            await busquedaPage.abrirBitacoraDelPrimerComprobante();
            try {
                await busquedaPage.validarSinDescargoInventarios();
                await busquedaPage.cerrarBitacora();
                return true;
            } catch {
                await busquedaPage.cerrarBitacora().catch(() => {});
                return false;
            }
        };
    }
};
