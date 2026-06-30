import type { Page, Response } from '@playwright/test';

// ─── Tipos de respuesta de API ────────────────────────────────────────────────

export interface CobroCreado {
    Id: number;
    Hojas: Array<{ Id: number }>;
}

export interface PagoCreado {
    Id: number;
    Hojas: Array<{ Id: number }>;
}

export interface IngresoEgresoCreado {
    Id: number;
    Hojas: Array<{ Id: number }>;
}

export interface MovimientoCaja {
    IdDocFinanciero: number;
    CorrelativoDocFinanciero: number;
    SerieFinal: string;
    TipoComprobanteDesc?: string;
    ReceptorRazonSocial?: string;
    MontoMovimiento?: number;
    FechaMov?: string;
    TipoPagoDesc?: string;
    IdMonedaMovimiento?: number;
}

export interface MovimientosResponse {
    Data: MovimientoCaja[];
}

// ─── Helpers de intercepción de red ──────────────────────────────────────────

/**
 * Captura el IdDocFinanciero (Hojas[0].Id) de la respuesta de creación de un cobro.
 * Usar ANTES de hacer click en el botón que dispara el POST.
 *
 * @example
 * const [idDocFinanciero] = await Promise.all([
 *   capturarIdDocFinancieroCobro(page),
 *   page.getByRole('button', { name: 'Aceptar' }).click(),
 * ]);
 */
export async function capturarIdDocFinancieroCobro(page: Page): Promise<number> {
    const response = await page.waitForResponse(
        (resp: Response) =>
            resp.url().includes('/PuntoVenta/api/v1/cobros/documentos') &&
            resp.request().method() === 'POST',
        { timeout: 30_000 },
    );
    const json: CobroCreado = await response.json();
    const idDocFinanciero = json.Hojas?.[0]?.Id; 
    if (!idDocFinanciero) {
        throw new Error('[CajaMovimientosApi] POST cobros/documentos no retornó json.Hojas[0].Id');
    }
    return idDocFinanciero;
}

/**
 * Captura el IdDocFinanciero (Hojas[0].Id) de la respuesta de creación de un pago a proveedor.
 */
export async function capturarIdDocFinancieroPago(page: Page): Promise<number> {
    const response = await page.waitForResponse(
        (resp: Response) =>
            resp.url().includes('/PuntoVenta/api/v1/pagos/documentos') &&
            resp.request().method() === 'POST',
        { timeout: 30_000 },
    );
    const json: PagoCreado = await response.json();
    const idDocFinanciero = json.Hojas?.[0]?.Id;
    if (!idDocFinanciero) {
        throw new Error('[CajaMovimientosApi] POST pagos/documentos no retornó Hojas[0].Id');
    }
    return idDocFinanciero;
}



/**
 * Busca un movimiento de caja por IdDocFinanciero interceptando la llamada a /movimientos.
 * Usar después de hacer cualquier acción que dispare el endpoint de movimientos
 * (ej: click en "Buscar" dentro de cierre de caja > Cobros y pagos).
 */
export async function obtenerMovimientoPorId(
    page: Page,
    idDocFinanciero: number,
): Promise<MovimientoCaja> {
    const response = await page.waitForResponse(
        async (resp: Response) => {
            if (
                resp.url().includes('/Finanzas/api/v2/cajas/') &&
                resp.url().includes('/movimientos') &&
                resp.status() === 200
            ) {
                try {
                    const json: MovimientosResponse = await resp.json();
                    return json.Data?.some((m) => m.IdDocFinanciero === idDocFinanciero);
                } catch {
                    return false;
                }
            }
            return false;
        },
        { timeout: 30_000 },
    );

    const json: MovimientosResponse = await response.json();
    const movimiento = json.Data?.find((m) => m.IdDocFinanciero === idDocFinanciero);
    if (!movimiento) {
        throw new Error(
            `[CajaMovimientosApi] No se encontró movimiento con IdDocFinanciero=${idDocFinanciero}`,
        );
    }
    return movimiento;
}

/**
 * Busca un movimiento de caja por Concepto interceptando la llamada a /movimientos.
 */
export async function obtenerMovimientoPorConcepto(
    page: Page,
    concepto: string,
): Promise<MovimientoCaja> {
    const response = await page.waitForResponse(
        async (resp: Response) => {
            if (
                resp.url().includes('/Finanzas/api/v2/cajas/') &&
                resp.url().includes('/movimientos') &&
                resp.status() === 200
            ) {
                try {
                    const json: MovimientosResponse = await resp.json();
                    return json.Data?.some((m) => m.Concepto === concepto);
                } catch {
                    return false;
                }
            }
            return false;
        },
        { timeout: 30_000 },
    );

    const json: MovimientosResponse = await response.json();
    const movimiento = json.Data?.find((m) => m.Concepto === concepto);
    if (!movimiento) {
        throw new Error(
            `[CajaMovimientosApi] No se encontró movimiento con Concepto=${concepto}`,
        );
    }
    return movimiento;
}

/**
 * Forma el número de recibo a partir de un movimiento.
 * Ej: "RC01-497"
 */
export function formarNumeroRecibo(movimiento: MovimientoCaja): string {
    return `${movimiento.SerieFinal}-${movimiento.CorrelativoDocFinanciero}`;
}
