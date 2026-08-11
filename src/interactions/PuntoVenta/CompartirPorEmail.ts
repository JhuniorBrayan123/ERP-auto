import { type Page } from '@playwright/test';
import { PostEmisionPage } from '@pages/PuntoVenta/PostEmisionPage';

export const CompartirPorEmail = (correo: string) => {
    const fn = async (page: Page): Promise<void> => {
        const postEmisionPage = new PostEmisionPage(page);
        await postEmisionPage.enviarEmail(correo);
    };
    fn.displayName = `Compartir por email a: ${correo}`;
    return fn;
};
