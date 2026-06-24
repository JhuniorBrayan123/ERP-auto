import {Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

export class ClonarComprobante {
    static haciaCaja(nombreCaja: string) {
        const fn = async (page: Page) => {
            const busqueda = new BusquedaComprobantesPage(page);
            await busqueda.clonarHaciaCaja(nombreCaja);
        };
        fn.displayName = `Clonar comprobante hacia caja: ${nombreCaja}`;
        return fn;
    }

    static validarCajaBloqueada(nombreCaja: string, mensaje: string = 'No puedes usar esta caja') {
        const fn = async (page: Page) => {
            const busqueda = new BusquedaComprobantesPage(page);
            await busqueda.validarCajaBloqueada(nombreCaja, mensaje);
        };
        fn.displayName = `Validar caja bloqueada: ${nombreCaja} - ${mensaje}`;
        return fn;
    }
}
