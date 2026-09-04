import {type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/busqueda-comprobantes';
import {BC_COLUMN_IDS} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

type CategoriaOrigen = 'COTIZACIONES' | 'PEDIDOS';


export const ValoresColumnaFacturado = (categoria: CategoriaOrigen, correlativo: string) =>
    async (page: Page): Promise<string[]> => {
        const busqueda = new BusquedaComprobantesPage(page);

        await busqueda.abrirConfiguracionColumnas();
        await busqueda.configurarColumna(categoria, BC_COLUMN_IDS.FACTURADO, true);
        await busqueda.guardarConfiguracionColumnas();

        await busqueda.filtrarPorCorrelativo(correlativo);

        return busqueda.grid.obtenerValoresColumnaExacta('Facturado');
    };
