import { expect, type Page } from '@playwright/test';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import type { DatosCliente, ItemVenta } from '@helpers/PuntoVenta/emision.types';
import type { ResultadoEmision } from './EmitirComprobanteSimple';

export interface DatosExportacion {
    cliente: DatosCliente & { textoSelector?: string };
    productos: ItemVenta[];
}

export const EmitirFacturaExportacion = (datos: DatosExportacion) => {
    const fn = async (page: Page): Promise<ResultadoEmision> => {
        await SeleccionarTipoComprobante('FACTURA')(page);
        await BuscarYSeleccionarCliente(datos.cliente)(page);

        
        await FacturacionTargets.sliderExportacion(page).click();
        await page.waitForLoadState('networkidle').catch(() => {});

        for (const producto of datos.productos) {
            await BuscarYAgregarProducto(producto)(page);
        }

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
    fn.displayName = `Emitir Factura de Exportación — ${datos.cliente.nombre}`;
    return fn;
};

