import {type Page} from '@playwright/test';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';

export const NavegarACajaPos = () => {
    const fn = async (page: Page): Promise<void> => {
        await page.goto('/punto-venta/cajas');
        const cajaPage = new CajaPage(page, 'caja-auto');
        await cajaPage.asegurarCajaAbierta();
    };
    fn.displayName = 'Navegar a Caja POS y asegurar apertura';
    return fn;
};

export const NavegarANuevaCompra = () => {
    const fn = async (page: Page): Promise<void> => {
        // En el codegen se hace clic en 'Ventas y compras' -> 'Nueva compra'
        await page.goto('/punto-venta/compras/registro');
        // Esperamos a que cargue
        await page.waitForLoadState('networkidle').catch(() => {});
    };
    fn.displayName = 'Navegar a Nueva Compra';
    return fn;
};

export const NavegarANuevaGuiaRemision = () => {
    const fn = async (page: Page): Promise<void> => {
        // En el codegen hace una redirección via cajas. Haremos eso o navegaremos directo
        await page.goto('/punto-venta/guia-remision-remitente/registro');
        await page.waitForLoadState('networkidle').catch(() => {});
    };
    fn.displayName = 'Navegar a Nueva Guía de Remisión';
    return fn;
};
