import { type Page } from '@playwright/test';
import { ClientePage } from '@pages/PuntoVenta/ClientePage';
import type { DatosCliente } from '@app-types/emision.types';

export const SeleccionarCliente = (cliente: DatosCliente & { textoSelector?: string }) => {
    const fn = async (page: Page): Promise<void> => {
        const clientePage = new ClientePage(page);
        await clientePage.buscarCliente(cliente.documento);
        await clientePage.seleccionarClientePorTexto(cliente.textoSelector || cliente.nombre);
    };
    fn.displayName = `Seleccionar cliente: ${cliente.nombre}`;
    return fn;
};
