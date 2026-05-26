import {type Page} from '@playwright/test';
import {PostEmisionPage} from '@pages/PuntoVenta/PostEmisionPage';

export const EnviarPorEmail = (email: string) => {
    const fn = async (page: Page): Promise<void> => {
        const postEmision = new PostEmisionPage(page);
        await postEmision.enviarEmail(email);
    };
    fn.displayName = `Enviar por email a: ${email}`;
    return fn;
};
