import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {EmisionResult} from "@app-types/emision.types";
import {ClickNuevaVenta} from "@interactions/PuntoVenta/ClickNuevaVenta";

export interface NoMuestraDescargoInventarioOptions {
    
    skipClickNuevaVenta?: boolean;
}

export const BitacoraComprobante = {
    noMuestraDescargoInventario: (
        resultadoPedido?: { current: EmisionResult | null },
        opts?: NoMuestraDescargoInventarioOptions,
    ) => {
        return async (page: Page): Promise<boolean> => {
            const busquedaPage = new BusquedaComprobantesPage(page);
            const busquedaComprobantesPage = new BusquedaComprobantesPage(page);

            if (opts?.skipClickNuevaVenta) {
                
                
                const btnNuevaVenta = page.getByRole('button', {name: 'Nueva Venta'});
                await btnNuevaVenta.waitFor({state: 'hidden', timeout: 20_000}).catch(() => {
                });
            } else {
                await ClickNuevaVenta()(page);
            }

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