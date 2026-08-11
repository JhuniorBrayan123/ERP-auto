import type { Page, Response } from '@playwright/test';



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
    Concepto?: string;
}

export interface MovimientosResponse {
    Data: MovimientoCaja[];
}



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

export function formarNumeroRecibo(movimiento: MovimientoCaja): string {
    return `${movimiento.SerieFinal}-${movimiento.CorrelativoDocFinanciero}`;
}
