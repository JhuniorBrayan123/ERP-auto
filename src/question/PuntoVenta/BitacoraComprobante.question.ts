import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {EmisionResult} from "@app-types/emision.types";
import {ClickNuevaVenta} from "@interactions/PuntoVenta/ClickNuevaVenta";

export const BitacoraComprobante = {
    noMuestraDescargoInventario: (resultadoPedido?: { current: EmisionResult | null }) => {
        return async (page: Page): Promise<boolean> => {
            const busquedaPage = new BusquedaComprobantesPage(page);
            const busquedaComprobantesPage = new BusquedaComprobantesPage(page);
            await ClickNuevaVenta()(page);
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