import { expect, type Page } from '@playwright/test';
import { CierreCajaTargets } from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import { VentasCajaTargets } from '@screenplay/targets/cierre-caja/VentasCajaTargets';

export interface FiltrosVentas {
    tipoDocumento?: 'Boleta' | 'Factura' | 'Nota de Débito' | 'Nota de Venta';
    serie?: string;
    correlativo?: string;
    estado?: string;
}

// ─── Task: ConsultarVentasDeCaja ─────────────────────────────────────────────
/**
 * Navega a la pestaña "Ventas" dentro del módulo Cierre de Caja.
 * Precondición: el actor ya debe estar en la pantalla de Cierre de Caja.
 */
export const ConsultarVentasDeCaja = () => {
    const fn = async (page: Page): Promise<void> => {
        await CierreCajaTargets.tabVentas(page).click();
        await expect(VentasCajaTargets.btnFiltrosAvanzados(page)).toBeVisible({ timeout: 10_000 });
    };
    fn.displayName = 'Consultar ventas en Cierre de Caja';
    return fn;
};

// ─── Task: BuscarComprobanteEnVentas ─────────────────────────────────────────
/**
 * Aplica filtros avanzados en la pestaña Ventas y espera resultados.
 * Limpia los filtros solo si se llama a BorrarFiltrosVentas.
 */
export const BuscarComprobanteEnVentas = (filtros: FiltrosVentas) => {
    const fn = async (page: Page): Promise<void> => {
        await VentasCajaTargets.btnFiltrosAvanzados(page).click();

        if (filtros.tipoDocumento) {
            await VentasCajaTargets.selectorTipoDocumento(page).click();
            await page.getByText(filtros.tipoDocumento, { exact: true }).click();
        }

        if (filtros.serie) {
            await VentasCajaTargets.selectorSerie(page).click();
            // Serie se selecciona de la cabecera de la tabla de filtros
            await page.locator('thead').getByText(filtros.serie).click();
        }

        if (filtros.correlativo) {
            await VentasCajaTargets.inputCorrelativo(page).click();
            await VentasCajaTargets.inputCorrelativo(page).fill(filtros.correlativo);
            
            // Esperamos a que la petición de búsqueda se complete después de dar Enter
            await Promise.all([
                page.waitForResponse(res => res.status() === 200 && res.request().method() === 'GET').catch(() => {}),
                VentasCajaTargets.inputCorrelativo(page).press('Enter')
            ]);
            
            // Pequeña pausa extra para asegurar el renderizado
            await page.waitForTimeout(500);
        }

        if (filtros.estado) {
            await VentasCajaTargets.selectorEstado(page).click();
            await page.locator('thead').getByText(filtros.estado).click();
            await page.waitForTimeout(500);
        }

        // Esperar que la tabla cargue (esto puede pasar instantáneamente si ya había filas)
        await expect(VentasCajaTargets.btnAccionesFila(page, 0)).toBeVisible({ timeout: 15_000 });
    };

    fn.displayName = `Buscar comprobante en Ventas: ${JSON.stringify(filtros)}`;
    return fn;
};

// ─── Task: BorrarFiltrosVentas ────────────────────────────────────────────────
export const BorrarFiltrosVentas = () => {
    const fn = async (page: Page): Promise<void> => {
        await VentasCajaTargets.btnBorrarFiltros(page).click();
    };
    fn.displayName = 'Borrar filtros en Ventas';
    return fn;
};

// ─── Task: VerPagoDeComprobante ───────────────────────────────────────────────
/**
 * Abre el menú de acciones de la primera fila visible y selecciona "Ver Pago".
 * Precondición: ya se aplicaron filtros y hay exactamente una fila visible.
 */
export const VerPagoDeComprobante = () => {
    const fn = async (page: Page): Promise<void> => {
        await VentasCajaTargets.btnAccionesFila(page, 0).click();
        await VentasCajaTargets.opcionVerPago(page).click();

        // Verificar que el modal de Ver Pago se abrió
        await expect(page.getByText(/Método de pago/i).first()).toBeVisible({ timeout: 10_000 });
    };
    fn.displayName = 'Ver Pago del comprobante seleccionado';
    return fn;
};

// ─── Task: CerrarModalVerPago ─────────────────────────────────────────────────
export const CerrarModalVerPago = () => {
    const fn = async (page: Page): Promise<void> => {
        await VentasCajaTargets.overlayModal(page).click();
    };
    fn.displayName = 'Cerrar modal Ver Pago';
    return fn;
};
