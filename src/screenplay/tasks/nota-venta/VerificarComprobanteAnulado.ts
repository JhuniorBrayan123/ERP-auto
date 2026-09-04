import {expect, type Page} from '@playwright/test';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';


export const VerificarComprobanteAnulado = ({
    numeroCompleto,
}: {
    numeroCompleto: string;
}) => {
    const fn = async (page: Page): Promise<void> => {
        const busqueda = new BusquedaComprobantesPage(page);
        const celdasEstado = busqueda.grid.obtenerCeldasDeEstado(numeroCompleto);

        
        await expect(celdasEstado.nth(0)).toHaveText('ELIMINADO');
        
        await expect(celdasEstado.nth(1)).toHaveText('ANULADO');

        
        const celdaSunat = await busqueda.grid.obtenerCeldaSunat(numeroCompleto);
        await expect(celdaSunat).toHaveText(/^\s*$/);
    };

    fn.displayName = `Verificar comprobante ${numeroCompleto} dado de baja (ELIMINADO/ANULADO/SUNAT vacío)`;
    return fn;
};