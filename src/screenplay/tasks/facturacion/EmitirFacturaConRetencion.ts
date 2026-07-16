import {expect, type Page} from '@playwright/test';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {BuscarYSeleccionarCliente} from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import {BuscarYAgregarProducto} from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import {FacturacionTargets} from '@screenplay/targets/facturacion/FacturacionTargets';
import {ConfirmarPago} from '@screenplay/interactions/facturacion/ConfirmarPago';

import type {DatosCliente, ItemVenta} from '@helpers/PuntoVenta/emision.types';
import type {ResultadoEmision} from './EmitirComprobanteSimple';

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
        await inputRetencion.waitFor({state: 'visible', timeout: 5000});
        await inputRetencion.fill('');
        await inputRetencion.pressSequentially(datos.porcentajeRetencion, {delay: 150});

        const {serie, correlativo, comprobanteId} = await ConfirmarPago('efectivo')(page);

        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible({timeout: 15_000});
        await FacturacionTargets.btnNuevaVenta(page).click();
        await page.waitForLoadState('networkidle').catch(() => {
        });
        const numero = `${serie}-${correlativo.padStart(8, '0')}`;
        return {serie, correlativo, comprobanteId, numero};
    };
    fn.displayName = `Emitir Factura con Retención ${datos.porcentajeRetencion}%`;
    return fn;
};

