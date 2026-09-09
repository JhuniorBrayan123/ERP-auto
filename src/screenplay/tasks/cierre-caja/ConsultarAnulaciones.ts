import { expect, type Page } from '@playwright/test';
import { CierreCajaTargets } from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import { AnulacionesNCTargets } from '@screenplay/targets/cierre-caja/AnulacionesNCTargets';
import { esperarCargaOverlay } from '@utils/wait-helpers';

export interface FiltrosAnulacion {
    tipoDocumento?: 'Boleta' | 'Factura' | 'Nota de Venta';
    correlativo?: string;
}

export interface FiltrosNotaCredito {
    serie?: string;
    correlativo?: string;
}


export const ConsultarAnulaciones = () => {
    const fn = async (page: Page): Promise<void> => {
        await CierreCajaTargets.tabAnulacionesNC(page).click();
        await expect(
            AnulacionesNCTargets.btnFiltrosAvanzadosAnulaciones(page)
        ).toBeVisible({ timeout: 10_000 });
    };
    fn.displayName = 'Consultar pestaña Anulaciones y Notas de Crédito';
    return fn;
};


export const BuscarAnulacionEnCierre = (filtros: FiltrosAnulacion) => {
    const fn = async (page: Page): Promise<void> => {
        await AnulacionesNCTargets.btnFiltrosAvanzadosAnulaciones(page).click();

        if (filtros.tipoDocumento) {
            await AnulacionesNCTargets.selectorTipoDocumentoAnulaciones(page).click();
            await page.getByText(filtros.tipoDocumento, { exact: true }).click();
        }

        if (filtros.correlativo) {
            await AnulacionesNCTargets.inputCorrelativoAnulaciones(page).click();
            await AnulacionesNCTargets.inputCorrelativoAnulaciones(page).fill(filtros.correlativo);
            await AnulacionesNCTargets.inputCorrelativoAnulaciones(page).press('Enter');

            await esperarCargaOverlay(page);
        }
    };

    fn.displayName = `Buscar anulación en cierre: ${JSON.stringify(filtros)}`;
    return fn;
};


export const BuscarNotaCreditoEnCierre = (filtros: FiltrosNotaCredito) => {
    const fn = async (page: Page): Promise<void> => {
        await AnulacionesNCTargets.btnFiltrosAvanzadosNC(page).click();

        if (filtros.serie) {
            await AnulacionesNCTargets.selectorSerieNC(page).click();
            await AnulacionesNCTargets.opcionDropdownAbierto(page, filtros.serie).click();
        }

        if (filtros.correlativo) {
            await AnulacionesNCTargets.inputCorrelativoNC(page).click();
            await AnulacionesNCTargets.inputCorrelativoNC(page).fill(filtros.correlativo);
        }
    };

    fn.displayName = `Buscar nota de crédito en cierre: serie=${filtros.serie} correlativo=${filtros.correlativo}`;
    return fn;
};


export interface DatosAnulacion {
    tipoComprobante: 'BOLETA DE VENTA' | 'FACTURA' | 'NOTA DE VENTA' | 'NOTA DE CRÉDITO' | 'NOTA DE DÉBITO';
    serie: string;
    correlativo: string;
    motivoAnulacion: string;
}

export const AnularComprobanteDesdeMenu = (datos: DatosAnulacion) => {
    const fn = async (page: Page): Promise<void> => {
        
        await AnulacionesNCTargets.selectorTipoAnulacion(page).click();
        
        await AnulacionesNCTargets.opcionDropdownAbierto(page, datos.tipoComprobante).click();

        
        if (datos.tipoComprobante !== 'NOTA DE VENTA') {
            await page.getByText('Seleccionar').click(); 
            await AnulacionesNCTargets.opcionDropdownAbierto(page, datos.serie).click();
        }

        
        await AnulacionesNCTargets.inputCorrelativoAnulacion(page).click();
        await AnulacionesNCTargets.inputCorrelativoAnulacion(page).fill(datos.correlativo);
        await AnulacionesNCTargets.btnBuscarAnulacion(page).click();

        
        await expect(
            page.getByText(new RegExp(`${datos.serie}.*${datos.correlativo.padStart(8, '0')}`))
        ).toBeVisible({ timeout: 10_000 });

        
        await AnulacionesNCTargets.selectorMotivoAnulacion(page).click();
        await page.getByText(datos.motivoAnulacion).click();

        
        await AnulacionesNCTargets.btnAnular(page).click();
        await expect(AnulacionesNCTargets.toastAnulacionExitosa(page)).toBeVisible({ timeout: 15_000 });
        await AnulacionesNCTargets.btnCerrarModalAnulacion(page).click();
    };

    fn.displayName = `Anular ${datos.tipoComprobante} ${datos.serie}-${datos.correlativo}`;
    return fn;
};
