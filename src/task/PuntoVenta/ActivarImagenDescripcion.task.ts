import { type Page } from '@playwright/test';
import { CotizacionOpcionesPage } from '@pages/PuntoVenta/CotizacionOpcionesPage';

export const ActivarImagenDescripcion = (incluirImagen: boolean, incluirDescripcion: boolean) => {
    const fn = async (page: Page): Promise<void> => {
        const opcionesPage = new CotizacionOpcionesPage(page);
        if (incluirImagen) {
            await opcionesPage.activarIncluirImagenes();
        }
        if (incluirDescripcion) {
            await opcionesPage.activarIncluirDescripcion();
        }
    };
    fn.displayName = `Activar imagen: ${incluirImagen}, descripcion: ${incluirDescripcion}`;
    return fn;
};
