import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import {FiltrarComprobantePorTipo} from '@task/PuntoVenta/FiltrarComprobantePorTipo.task';
import {esperarCargaOverlay} from '@utils/wait-helpers';
import type {TipoOrigen} from '@screenplay/interactions/facturacion/ConvertirComprobanteDesdeDetalle';

/**
 * Clona un comprobante (Cotización | Pedido) DESDE el popup de Ver Comprobante
 * hacia una caja destino. Espejo de ClonarComprobante (menú de grilla) pero
 * iniciado desde el detalle: abre Ver Comprobante → "Clonar" → selecciona la
 * caja → Continuar → devuelve la Page del popup de emisión (ventana nueva con
 * la venta cargada con los datos del origen).
 *
 * El retorno `Page` permite validar la transferencia de datos (cliente + items)
 * con el patrón BC-21.1 (`getByRole('main')` contiene los datos del origen).
 */
export class ClonarComprobanteDesdeDetalle {
    static haciaCaja(numeroComprobante: string, tipoOrigen: TipoOrigen, nombreCaja: string) {
        const fn = async (page: Page): Promise<Page> => {
            const busqueda = new BusquedaComprobantesPage(page);

            // 1) Búsqueda de Comprobantes → categoría origen → correlativo
            await busqueda.ir();
            await FiltrarComprobantePorTipo(tipoOrigen === 'COTIZACION' ? 'COTIZACIONES' : 'PEDIDOS')(page);
            await busqueda.filtrarPorCorrelativo(numeroComprobante);

            // 2) Abrir el popup de Ver Comprobante (fila filtrada)
            const verPopup = await busqueda.abrirVerComprobante();
            await esperarCargaOverlay(verPopup);

            // 3) En el popup: "Clonar" → caja destino → Continuar → popup de emisión
            await busqueda.verComprobante.clickClonar(verPopup);
            await busqueda.verComprobante.seleccionarCajaEnPopup(verPopup, nombreCaja);
            return busqueda.verComprobante.confirmarClonacionEnPopup(verPopup);
        };
        fn.displayName = `Clonar ${numeroComprobante} (${tipoOrigen}) hacia ${nombreCaja} desde ver comprobante`;
        return fn;
    }
}
