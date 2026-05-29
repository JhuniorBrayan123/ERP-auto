import { type Page } from '@playwright/test';
import { ClientePage } from '@pages/PuntoVenta/ClientePage';
import type { DatosCliente } from '@app-types/emision.types';

export const SeleccionarClienteSinDoc = (cliente: DatosCliente) => {
    const fn = async (page: Page): Promise<void> => {
        const clientePage = new ClientePage(page);
        
        await clientePage.llenarDatosClienteSinDocumento(cliente.nombre, 'Direccion por defecto');
    };
    fn.displayName = `Seleccionar cliente sin doc: ${cliente.nombre}`;
    return fn;
};
