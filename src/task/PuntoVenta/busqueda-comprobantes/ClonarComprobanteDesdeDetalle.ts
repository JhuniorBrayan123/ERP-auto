import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {FiltrarComprobantePorTipo} from '@task/PuntoVenta/FiltrarComprobantePorTipo.task';
import {esperarCargaOverlaySiVisible} from '@utils/wait-helpers';
import type {TipoOrigen} from '@screenplay/interactions/facturacion/ConvertirComprobanteDesdeDetalle';


export class ClonarComprobanteDesdeDetalle {
    static haciaCaja(numeroComprobante: string, tipoOrigen: TipoOrigen, nombreCaja: string) {
        const fn = async (page: Page): Promise<Page> => {
            const busqueda = new BusquedaComprobantesPage(page);

            
            await busqueda.ir();
            await FiltrarComprobantePorTipo(tipoOrigen === 'COTIZACION' ? 'COTIZACIONES' : 'PEDIDOS')(page);
            await busqueda.filtrarPorCorrelativo(numeroComprobante);

            
            const verPopup = await busqueda.abrirVerComprobante();
            await esperarCargaOverlaySiVisible(verPopup);
            await busqueda.verComprobante.clickClonar(verPopup);
            await busqueda.verComprobante.seleccionarCajaEnPopup(verPopup, nombreCaja);
            return busqueda.verComprobante.confirmarClonacionEnPopup(verPopup);
        };
        fn.displayName = `Clonar ${numeroComprobante} (${tipoOrigen}) hacia ${nombreCaja} desde ver comprobante`;
        return fn;
    }
}
