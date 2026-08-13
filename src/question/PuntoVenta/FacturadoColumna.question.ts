import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/busqueda-comprobantes';
import {BC_COLUMN_IDS} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

type CategoriaOrigen = 'COTIZACIONES' | 'PEDIDOS';

/**
 * Devuelve los valores de la columna "Facturado" de la fila(s) cuyo correlativo
 * coincide con `correlativo` en Búsqueda de Comprobantes.
 *
 * Precondiciones:
 * - La categoría origen (COTIZACIONES | PEDIDOS) ya fue seleccionada en la grilla
 *   (p.ej. vía FiltrarComprobantePorTipo) — el menú de configuración de columnas
 *   muestra los campos de la categoría activa.
 *
 * Pasos:
 * 1. Activa la columna "Facturado" (campoId `IdsFacturados`) si no está visible
 *    (DOM discovery 13-Ago-2026: item-{CAT}-IdsFacturados existe en CT y PD).
 * 2. Filtra por correlativo del comprobante origen.
 * 3. Devuelve los valores de la celda "Facturado" (formato esperado: "SI"; el bug
 *    de producto CT01-174/B001-631 muestra "No" pese a estar facturado).
 *
 * Si el campoId no existiera en la configuración, `obtenerValoresColumnaExacta`
 * lanza un error (bloqueo informativo — no se silencia).
 */
export const ValoresColumnaFacturado = (categoria: CategoriaOrigen, correlativo: string) =>
    async (page: Page): Promise<string[]> => {
        const busqueda = new BusquedaComprobantesPage(page);

        await busqueda.abrirConfiguracionColumnas();
        await busqueda.configurarColumna(categoria, BC_COLUMN_IDS.FACTURADO, true);
        await busqueda.guardarConfiguracionColumnas();

        await busqueda.filtrarPorCorrelativo(correlativo);

        return busqueda.grid.obtenerValoresColumnaExacta('Facturado');
    };
