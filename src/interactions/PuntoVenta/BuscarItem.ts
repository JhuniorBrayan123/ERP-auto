import { Page } from '@playwright/test';
import { EmisionPage } from '../../pages/PuntoVenta/EmisionPage';

export const BuscarItem = (codigo: string) => {
    const fn = async (page: Page): Promise<void> => {
        const emision = new EmisionPage(page);
        await emision.buscarItem(codigo);
    };
    fn.displayName = 'Buscar item';
    return fn;
};
