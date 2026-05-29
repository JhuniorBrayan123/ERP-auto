import {type Page} from '@playwright/test';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';

export const IniciarVentaEnCaja = (nombreCaja: string = 'caja-auto') => {
    const fn = async (page: Page): Promise<void> => {
        await page.goto('/');
        await page.getByText('Ventas y compras').click();
        await page.getByText('Nueva venta', {exact: true}).click();

        const cajaPage = new CajaPage(page, nombreCaja);
        await cajaPage.asegurarCajaAbierta();
    };
    fn.displayName = `Iniciar venta en caja (${nombreCaja})`;
    return fn;
};
