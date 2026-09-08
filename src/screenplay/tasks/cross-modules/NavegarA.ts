import {type Page} from '@playwright/test';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';
import {esperarCargaOverlaySiVisible} from "@utils/wait-helpers";

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

        await page.goto('punto-venta/compras/registro-compra');
        await page.waitForLoadState('networkidle').catch(() => {
        });
        await esperarCargaOverlaySiVisible(page);
    };
    fn.displayName = 'Navegar a Nueva Compra';
    return fn;
};

export const NavegarANuevaGuiaRemision = () => {
    const fn = async (page: Page): Promise<void> => {

        await page.goto('/punto-venta/guia-remision-remitente');
        await page.waitForLoadState('networkidle').catch(() => {
        });
        await esperarCargaOverlaySiVisible(page);
    };
    fn.displayName = 'Navegar a Nueva Guía de Remisión';
    return fn;
};
