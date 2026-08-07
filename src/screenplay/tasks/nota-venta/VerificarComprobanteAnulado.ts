import {expect, type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

/**
 * Verifica que el comprobante anulado queda dado de baja (ELIMINADO),
 * con pago ANULADO y estado SUNAT vacío en la búsqueda.
 */
export const VerificarComprobanteAnulado = ({
    numeroCompleto,
}: {
    numeroCompleto: string;
}) => {
    const fn = async (page: Page): Promise<void> => {
        const busqueda = new BusquedaComprobantesPage(page);
        const celdasEstado = busqueda.grid.obtenerCeldasDeEstado(numeroCompleto);

        // nth(0): Estado de comprobante
        await expect(celdasEstado.nth(0)).toHaveText('ELIMINADO');
        // nth(1): Estado de pago
        await expect(celdasEstado.nth(1)).toHaveText('ANULADO');

        // Estado SUNAT: para Notas de Venta la celda queda vacía (no se envía a SUNAT)
        const celdaSunat = await busqueda.grid.obtenerCeldaSunat(numeroCompleto);
        await expect(celdaSunat).toHaveText(/^\s*$/);
    };

    fn.displayName = `Verificar comprobante ${numeroCompleto} dado de baja (ELIMINADO/ANULADO/SUNAT vacío)`;
    return fn;
};