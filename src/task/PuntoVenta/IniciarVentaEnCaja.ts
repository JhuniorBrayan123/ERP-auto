import {type Page} from '@playwright/test';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';

/**
 * Inicia una venta en la caja especificada.
 *
 * Flujo:
 * 1. Navega a Ventas y compras → Nueva venta
 * 2. CajaPage busca la tarjeta de la caja, hace scroll hacia ella,
 *    detecta si está abierta o cerrada, y ejecuta la acción correspondiente
 * 3. Espera a que el punto de venta esté listo
 *
 * @param nombreCaja - Nombre de la caja objetivo (default: 'caja-auto').
 *                     Pasar CAJAS.VENTA.nombre para operar en "Caja de venta".
 */
export const IniciarVentaEnCaja = (nombreCaja: string = 'caja-auto') => {
    const fn = async (page: Page): Promise<void> => {
        await page.goto('/');
        await page.getByText('Ventas y compras').click();
        await page.getByText('Nueva venta', {exact: true}).click();

        // CajaPage se encarga del resto: scroll, detección, click, espera
        const cajaPage = new CajaPage(page, nombreCaja);
        await cajaPage.asegurarCajaAbierta();
    };
    fn.displayName = `Iniciar venta en caja (${nombreCaja})`;
    return fn;
};
