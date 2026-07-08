import { expect, type Page } from '@playwright/test';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';

import type { DatosCliente, ItemVenta } from '@helpers/PuntoVenta/emision.types';
import type { ResultadoEmision } from './EmitirComprobanteSimple';

export interface DatosRetencion {
    cliente: DatosCliente & { textoSelector?: string };
    productos: ItemVenta[];
    porcentajeRetencion: string; 
}

export const EmitirFacturaConRetencion = (datos: DatosRetencion) => {
    const fn = async (page: Page): Promise<ResultadoEmision> => {
        await SeleccionarTipoComprobante('FACTURA')(page);
        await BuscarYSeleccionarCliente(datos.cliente)(page);
        for (const producto of datos.productos) {
            await BuscarYAgregarProducto(producto)(page);
        }

        await page.waitForTimeout(500);
        await FacturacionTargets.sliderRetencion(page).click({force: true});
        await page.waitForTimeout(500);

        const inputRetencion = FacturacionTargets.inputPorcentajeRetencion(page);
        await inputRetencion.waitFor({ state: 'visible', timeout: 5000 });
        await inputRetencion.fill('');
        await inputRetencion.pressSequentially(datos.porcentajeRetencion, { delay: 150 });

        const btnGuardar = FacturacionTargets.btnGuardarRetencion(page);
        await btnGuardar.waitFor({ state: 'visible', timeout: 5000 });
        await btnGuardar.click();
        
        await FacturacionTargets.btnCerrarModal(page).click();

        const emisionPromise = page.waitForResponse(
            (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            { timeout: 45_000 }
        );
        await page.getByRole('button', { name: 'PAGAR' }).click();
        await page.getByRole('button', { name: 'Monto exacto' }).click();
        await page.getByRole('button', { name: 'Realizar Pago' }).click();

        const response = await emisionPromise;
        const body = await response.json();
        const nombrePdf: string = body.FilePdf?.Nombre ?? '';
        const serie = nombrePdf.split('-')[0] ?? '';
        const correlativo = String(body.CorrelativoDocumento ?? '');
        const comprobanteId = body.IdComprobante ?? 0;

        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible({ timeout: 15_000 });
        await FacturacionTargets.btnNuevaVenta(page).click();
        await page.waitForLoadState('networkidle').catch(() => {});
        const numero = `${serie}-${correlativo.padStart(8, '0')}`;
        return { serie, correlativo, comprobanteId, numero };
    };
    fn.displayName = `Emitir Factura con Retención ${datos.porcentajeRetencion}%`;
    return fn;
};

