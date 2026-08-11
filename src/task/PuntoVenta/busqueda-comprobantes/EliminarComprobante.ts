import {Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

export class EliminarComprobante {
    static conMotivo(motivo: string) {
        const fn = async (page: Page) => {
            const busqueda = new BusquedaComprobantesPage(page);
            await busqueda.seleccionarAccionPorId(
                'pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_acciones_li:eliminar-comprobante'
            );
            await busqueda.confirmarEliminacion(motivo);
            await busqueda.cerrarModalExito();
        };
        fn.displayName = `Eliminar comprobante con motivo: ${motivo}`;
        return fn;
    }
}
