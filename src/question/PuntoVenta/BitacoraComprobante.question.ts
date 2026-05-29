import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {PostEmisionPage} from "@pages/PuntoVenta/PostEmisionPage";
import {EmisionResult} from "@app-types/emision.types";

export const BitacoraComprobante = {
    noMuestraDescargoInventario: (resultadoPedido?: { current: EmisionResult | null }) => {
        return async (page: Page): Promise<boolean> => {
            const busquedaPage = new BusquedaComprobantesPage(page);
            const postEmisionPage = new PostEmisionPage(page);
            const busquedaComprobantesPage = new BusquedaComprobantesPage(page);

            await postEmisionPage.clickNuevaVenta()
            await busquedaComprobantesPage.navegarABusquedaComprobantes(resultadoPedido?.current)

            await busquedaPage.abrirBitacoraDelPrimerComprobante();
            try {
                await busquedaPage.validarSinDescargoInventarios();
                await busquedaPage.cerrarBitacora();
                return true;
            } catch {
                await busquedaPage.cerrarBitacora().catch(() => {
                });
                return false;
            }
        };
    }
};