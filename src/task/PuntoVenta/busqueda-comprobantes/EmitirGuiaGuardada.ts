import {Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

export class EmitirGuiaGuardada {
    static delComprobante() {
        const fn = async (page: Page) => {
            const busqueda = new BusquedaComprobantesPage(page);
            await busqueda.emitirGuiaRemisionGuardada();
            await busqueda.cerrarModalExito();
        };
        fn.displayName = `Emitir guía de remisión guardada`;
        return fn;
    }
}
