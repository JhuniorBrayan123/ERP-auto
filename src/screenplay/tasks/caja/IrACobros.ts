import { expect, type Page } from '@playwright/test';
import { MenuCajaTargets } from '@screenplay/targets/caja/MenuCajaTargets';
import { CobrosPagosTargets } from '@screenplay/targets/cierre-caja/CobrosPagosTargets';
import { esperarCargaOverlay } from '@utils/wait-helpers';
import { capturarIdDocFinancieroCobro } from '@services/PuntoVenta/CajaMovimientosApi';

export interface DatosCobro {
    /** Monto a cobrar */
    monto: string;
    /** Correlativo del comprobante a crédito que se va a cobrar (para buscar en la tabla) */
    correlativoComprobante?: string;
    /** ID del tipo de comprobante (Ej: '1003' para Factura, '1004' para Boleta) */
    tipoDocumentoId?: '1003' | '1004' | '1006' | '2016';
}

export interface ResultadoCobro {
    /** IdDocFinanciero del recibo de cobranza (Hojas[0].Id) */
    idDocFinanciero: number;
}

// ─── Task: IrACobros ─────────────────────────────────────────────────────────
export const IrACobros = () => {
    const fn = async (page: Page): Promise<void> => {
        await MenuCajaTargets.btnAbrirMenu(page).click();
        await MenuCajaTargets.opcionCobros(page).click();
        
        await esperarCargaOverlay(page);
        
        await expect(page.getByRole('button', { name: /^Buscar$/i })).toBeVisible({ timeout: 10_000 });
    };
    fn.displayName = 'Ir al módulo de Cobros';
    return fn;
};

// ─── Task: RegistrarCobroCliente ─────────────────────────────────────────────
/**
 * Filtra comprobantes en estado COBRO PENDIENTE y registra el cobro del primero
 * que coincida con el correlativo indicado. Captura el IdDocFinanciero vía API.
 */
export const RegistrarCobroCliente = (datos: DatosCobro) => {
    const fn = async (page: Page): Promise<ResultadoCobro> => {
        // Filtrar por estado COBRO PENDIENTE
        await CobrosPagosTargets.selectorEstadoCobro(page).click();
        await page.getByText('Todos').nth(1).click();
        await CobrosPagosTargets.opcionCobroPendiente(page).click();

        // Filtrar por tipo de documento usando el multiselect
        if (datos.tipoDocumentoId) {
            await CobrosPagosTargets.selectorTipoComprobanteCobro(page).click();
            // Desmarcar todos (por defecto vienen todos seleccionados)
            await CobrosPagosTargets.checkboxTipoComprobanteTodos(page).click();
            // Marcar solo el deseado
            await CobrosPagosTargets.checkboxTipoComprobanteOpcion(page, datos.tipoDocumentoId).click();
            // Clickea fuera para cerrar el multiselect (o el botón buscar lo cerrará)
            await page.mouse.click(0, 0); 
        }

        await CobrosPagosTargets.btnBuscarCobros(page).click();

        // Buscar la fila del comprobante por correlativo si se especificó
        let filaCobro;
        if (datos.correlativoComprobante) {
            filaCobro = page.getByRole('row', {
                name: new RegExp(datos.correlativoComprobante),
            });
        }

        // Click directo en el botón COBRAR de la primera fila
        await CobrosPagosTargets.btnCobrarFila(page).click();

        // Si el ERP muestra un alert de "comprobante ya seleccionado", aceptar y re-intentar
        const alertVisible = await page.getByText(/El comprobante seleccionado/i).isVisible({ timeout: 2_000 }).catch(() => false);
        if (alertVisible) {
            await CobrosPagosTargets.btnAceptarCobro(page).click();
            await CobrosPagosTargets.btnCobrarFila(page).click();
        }

        // Ingresar monto
        await CobrosPagosTargets.inputMontoCobro(page).click();
        await CobrosPagosTargets.inputMontoCobro(page).fill(datos.monto);

        // Interceptar POST y confirmar cobro
        const [idDocFinanciero] = await Promise.all([
            capturarIdDocFinancieroCobro(page),
            CobrosPagosTargets.btnAceptarCobro(page).click(),
        ]);

        await expect(CobrosPagosTargets.toastCobroExitoso(page)).toBeVisible({ timeout: 15_000 });
        await CobrosPagosTargets.btnAceptarCobro(page).click();

        return { idDocFinanciero };
    };

    fn.displayName = `Registrar cobro a cliente — S/${datos.monto}`;
    return fn;
};
