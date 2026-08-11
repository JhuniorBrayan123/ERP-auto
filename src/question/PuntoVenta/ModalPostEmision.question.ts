import { type Page } from '@playwright/test';
import { PostEmisionPage } from '@pages/PuntoVenta/PostEmisionPage';

export const ModalPostEmision = {
    estaVisible: () => {
        return async (page: Page): Promise<boolean> => {
            const postEmisionPage = new PostEmisionPage(page);
            return await postEmisionPage.estaVisible();
        };
    },
    tieneCorrelativo: () => {
        return async (page: Page): Promise<boolean> => {
            const postEmisionPage = new PostEmisionPage(page);
            const correlativo = await postEmisionPage.obtenerCorrelativoDinamico();
            return correlativo !== '';
        };
    }
};
