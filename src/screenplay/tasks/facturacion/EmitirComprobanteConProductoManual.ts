import {expect, type Page} from '@playwright/test';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {BuscarYSeleccionarCliente} from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import {AgregarProductoManual, type DatosProductoManual} from '@screenplay/interactions/facturacion/AgregarProductoManual';
import {ConfirmarPago} from '@screenplay/interactions/facturacion/ConfirmarPago';
import {FacturacionTargets} from '@screenplay/targets/facturacion/FacturacionTargets';
import type {DatosCliente} from '@helpers/PuntoVenta/emision.types';
import type {EmisionResult} from '@app-types/emision.types';

type TipoComprobante = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA';
type MetodoPago = 'efectivo' | 'cheque' | 'niubiz' | 'yape' | 'plin' | 'transferencia';

export interface DatosEmisionProductoManual {
    tipoComprobante: TipoComprobante;
    cliente?: DatosCliente & {textoSelector?: string};
    producto: DatosProductoManual;
    metodoPago?: MetodoPago;
}

export interface ResultadoEmision extends EmisionResult {
    numero: string;
}

export const EmitirComprobanteConProductoManual = (datos: DatosEmisionProductoManual) => {
    const fn = async (page: Page): Promise<ResultadoEmision> => {
        await SeleccionarTipoComprobante(datos.tipoComprobante)(page);
        if (datos.cliente) {
            await BuscarYSeleccionarCliente(datos.cliente)(page);
        }
        await AgregarProductoManual(datos.producto)(page);

        const resultado = await ConfirmarPago(datos.metodoPago ?? 'efectivo')(page);

        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible({timeout: 15_000});
        await FacturacionTargets.btnNuevaVenta(page).click();
        await page.waitForLoadState('networkidle').catch(() => {
        });

        const numero = `${resultado.serie}-${String(resultado.correlativo).padStart(8, '0')}`;
        return {...resultado, numero};
    };
    fn.displayName = datos.cliente
        ? `Emitir ${datos.tipoComprobante} con producto manual — ${datos.cliente.nombre}`
        : `Emitir ${datos.tipoComprobante} con producto manual — Consumidor Final`;
    return fn;
};