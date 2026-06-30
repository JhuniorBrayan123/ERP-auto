import { type Page } from '@playwright/test';
import { CierreCajaTargets } from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import { IngresosEgresosTargets } from '@screenplay/targets/cierre-caja/IngresosEgresosTargets';
import type { MovimientoCaja } from '@services/PuntoVenta/CajaMovimientosApi';

// ─── Question: MovimientoVisibleEnCierre ──────────────────────────────────────
/**
 * Verifica si un movimiento (ingreso o egreso) está visible en la pestaña
 * Ingresos y Egresos del Cierre de Caja, usando los datos del movimiento
 * capturado vía API.
 */
export const MovimientoVisibleEnCierre = (movimiento: MovimientoCaja) => {
    const fn = async (page: Page): Promise<boolean> => {
        const contenedor = CierreCajaTargets.contenedorPrincipal(page);

        const numRecibo = `${movimiento.SerieFinal}-${movimiento.CorrelativoDocFinanciero}`;
        const visible = await contenedor
            .getByText(new RegExp(numRecibo.replace('-', '-0*'), 'i'))
            .isVisible({ timeout: 5_000 })
            .catch(() => false);

        return visible;
    };

    fn.displayName = `¿Movimiento ${movimiento.SerieFinal}-${movimiento.CorrelativoDocFinanciero} visible en cierre?`;
    return fn;
};

// ─── Question: TotalIngresosVisible ───────────────────────────────────────────
/**
 * Lee el texto del total de Ingresos de la pantalla.
 */
export const TotalIngresosVisible = () => {
    const fn = async (page: Page): Promise<string> => {
        const texto = await IngresosEgresosTargets.seccionIngresos(page).textContent() ?? '';
        return texto.trim();
    };
    fn.displayName = 'Leer total de Ingresos';
    return fn;
};

// ─── Question: TotalEgresosVisible ────────────────────────────────────────────
/**
 * Lee el texto del total de Egresos de la pantalla.
 */
export const TotalEgresosVisible = () => {
    const fn = async (page: Page): Promise<string> => {
        const texto = await IngresosEgresosTargets.seccionEgresos(page).textContent() ?? '';
        return texto.trim();
    };
    fn.displayName = 'Leer total de Egresos';
    return fn;
};

// ─── Question: CobroVisibleEnCierre ───────────────────────────────────────────
/**
 * Verifica si el recibo de cobranza está visible en la pestaña Cobros y Pagos.
 */
export const CobroVisibleEnCierre = (movimiento: MovimientoCaja) => {
    const fn = async (page: Page): Promise<boolean> => {
        const contenedor = CierreCajaTargets.contenedorPrincipal(page);
        const numRecibo = `${movimiento.SerieFinal}-${movimiento.CorrelativoDocFinanciero}`;

        if (movimiento.ReceptorRazonSocial) {
            const clienteVisible = await contenedor
                .getByText(movimiento.ReceptorRazonSocial, { exact: false })
                .isVisible({ timeout: 5_000 })
                .catch(() => false);
            if (!clienteVisible) return false;
        }

        return contenedor
            .getByText(new RegExp(numRecibo), 'i' as any)
            .isVisible({ timeout: 5_000 })
            .catch(() => false);
    };

    fn.displayName = `¿Cobro ${movimiento.SerieFinal}-${movimiento.CorrelativoDocFinanciero} visible en cierre?`;
    return fn;
};

// ─── Question: PagoVisibleEnCierre ────────────────────────────────────────────
/**
 * Verifica si el recibo de pago está visible en la pestaña Cobros y Pagos.
 */
export const PagoVisibleEnCierre = (movimiento: MovimientoCaja) => {
    const fn = async (page: Page): Promise<boolean> => {
        const contenedor = CierreCajaTargets.contenedorPrincipal(page);
        return contenedor
            .getByText(`${movimiento.SerieFinal}-${movimiento.CorrelativoDocFinanciero}`, { exact: false })
            .isVisible({ timeout: 5_000 })
            .catch(() => false);
    };

    fn.displayName = `¿Pago ${movimiento.SerieFinal}-${movimiento.CorrelativoDocFinanciero} visible en cierre?`;
    return fn;
};

// ─── Question: ItemVendidoVisible ─────────────────────────────────────────────
/**
 * Verifica si un ítem aparece en la pestaña "Items vendidos".
 */
export const ItemVendidoVisible = (nombreItem: string) => {
    const fn = async (page: Page): Promise<boolean> => {
        return page
            .getByText(nombreItem, { exact: false })
            .nth(1)
            .isVisible({ timeout: 5_000 })
            .catch(() => false);
    };
    fn.displayName = `¿Ítem "${nombreItem}" visible en Items vendidos?`;
    return fn;
};

// ─── Question: ArchivoDescargado ─────────────────────────────────────────────
/**
 * Verifica que el nombre de archivo descargado tenga la extensión esperada.
 */
export const ArchivoDescargado = (nombreArchivo: string, extension: 'xlsx' | 'pdf') => {
    const fn = async (_page: Page): Promise<boolean> => {
        return new RegExp(`\\.${extension}$`, 'i').test(nombreArchivo);
    };
    fn.displayName = `¿Archivo "${nombreArchivo}" tiene extensión .${extension}?`;
    return fn;
};
