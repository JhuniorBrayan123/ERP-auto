import { expect, type Page } from '@playwright/test';
import { CierreCajaTargets } from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import { VentasCajaTargets } from '@screenplay/targets/cierre-caja/VentasCajaTargets';

export interface FiltrosVentas {
    tipoDocumento?: 'Boleta' | 'Factura' | 'Nota de Débito' | 'Nota de Venta';
    serie?: string;
    correlativo?: string;
    estado?: string;
}


export const ConsultarVentasDeCaja = () => {
    const fn = async (page: Page): Promise<void> => {
        await CierreCajaTargets.tabVentas(page).click();
        await expect(VentasCajaTargets.btnFiltrosAvanzados(page)).toBeVisible({ timeout: 10_000 });
    };
    fn.displayName = 'Consultar ventas en Cierre de Caja';
    return fn;
};


export const BuscarComprobanteEnVentas = (filtros: FiltrosVentas) => {
    const fn = async (page: Page): Promise<void> => {
        await VentasCajaTargets.btnFiltrosAvanzados(page).click();

        if (filtros.tipoDocumento) {
            await VentasCajaTargets.selectorTipoDocumento(page).click();
            await page.getByText(filtros.tipoDocumento, { exact: true }).click();
        }

        if (filtros.serie) {
            await VentasCajaTargets.selectorSerie(page).click();
            
            await page.locator('thead').getByText(filtros.serie).click();
        }

        if (filtros.correlativo) {
            await VentasCajaTargets.inputCorrelativo(page).click();
            await VentasCajaTargets.inputCorrelativo(page).fill(filtros.correlativo);
            
            
            await Promise.all([
                page.waitForResponse(res => res.status() === 200 && res.request().method() === 'GET').catch(() => {}),
                VentasCajaTargets.inputCorrelativo(page).press('Enter')
            ]);
            
            
            await page.waitForTimeout(500);
        }

        if (filtros.estado) {
            await VentasCajaTargets.selectorEstado(page).click();
            await page.locator('thead').getByText(filtros.estado).click();
            await page.waitForTimeout(500);
        }

        
        await expect(VentasCajaTargets.btnAccionesFila(page, 0)).toBeVisible({ timeout: 15_000 });
    };

    fn.displayName = `Buscar comprobante en Ventas: ${JSON.stringify(filtros)}`;
    return fn;
};


export const BorrarFiltrosVentas = () => {
    const fn = async (page: Page): Promise<void> => {
        await VentasCajaTargets.btnBorrarFiltros(page).click();
    };
    fn.displayName = 'Borrar filtros en Ventas';
    return fn;
};


export const VerPagoDeComprobante = () => {
    const fn = async (page: Page): Promise<void> => {
        await VentasCajaTargets.btnAccionesFila(page, 0).click();
        await VentasCajaTargets.opcionVerPago(page).click();

        
        await expect(page.getByText(/Método de pago/i).first()).toBeVisible({ timeout: 10_000 });
    };
    fn.displayName = 'Ver Pago del comprobante seleccionado';
    return fn;
};


export const CerrarModalVerPago = () => {
    const fn = async (page: Page): Promise<void> => {
        await VentasCajaTargets.overlayModal(page).click();
    };
    fn.displayName = 'Cerrar modal Ver Pago';
    return fn;
};
