import {Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';
import type {BcCategoria} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

export class FiltrarComprobantes {
    static conFiltrosAvanzados(categoria: BcCategoria, tipo: string, correlativo: string) {
        const fn = async (page: Page) => {
            const busqueda = new BusquedaComprobantesPage(page);
            await busqueda.ir();
            await busqueda.seleccionarCategoria(categoria);
            await busqueda.abrirFiltrosAvanzados();
            await busqueda.filtrarPorTipo(tipo);
            await busqueda.filtrarPorCorrelativos(correlativo);
        };
        fn.displayName = `Filtrar comprobantes: ${categoria} > ${tipo} > ${correlativo}`;
        return fn;
    }
}
