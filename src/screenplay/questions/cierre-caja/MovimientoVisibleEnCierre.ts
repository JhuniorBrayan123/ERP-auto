import { type Page } from '@playwright/test';
import { CierreCajaTargets } from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import { IngresosEgresosTargets } from '@screenplay/targets/cierre-caja/IngresosEgresosTargets';
import type { MovimientoCaja } from '@services/PuntoVenta/CajaMovimientosApi';


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


export const TotalIngresosVisible = () => {
    const fn = async (page: Page): Promise<string> => {
        const texto = await IngresosEgresosTargets.seccionIngresos(page).textContent() ?? '';
        return texto.trim();
    };
    fn.displayName = 'Leer total de Ingresos';
    return fn;
};


export const TotalEgresosVisible = () => {
    const fn = async (page: Page): Promise<string> => {
        const texto = await IngresosEgresosTargets.seccionEgresos(page).textContent() ?? '';
        return texto.trim();
    };
    fn.displayName = 'Leer total de Egresos';
    return fn;
};


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


export const ArchivoDescargado = (nombreArchivo: string, extension: 'xlsx' | 'pdf') => {
    const fn = async (_page: Page): Promise<boolean> => {
        return new RegExp(`\\.${extension}$`, 'i').test(nombreArchivo);
    };
    fn.displayName = `¿Archivo "${nombreArchivo}" tiene extensión .${extension}?`;
    return fn;
};
