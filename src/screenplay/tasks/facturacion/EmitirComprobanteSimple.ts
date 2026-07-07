import {expect, type Page} from '@playwright/test';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {BuscarYSeleccionarCliente} from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import {BuscarYAgregarProducto} from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import {ConfirmarPago} from '@screenplay/interactions/facturacion/ConfirmarPago';
import {FacturacionTargets} from '@screenplay/targets/facturacion/FacturacionTargets';
import type {DatosCliente, ItemVenta} from '@helpers/PuntoVenta/emision.types';
import type {EmisionResult} from '@app-types/emision.types';

type TipoComprobante = 'BOLETA' | 'FACTURA' | 'NOTA DE VENTA';
type MetodoPago = 'efectivo' | 'cheque' | 'niubiz' | 'yape' | 'plin' | 'transferencia';

export interface DatosEmisionSimple {
    tipoComprobante: TipoComprobante;
    cliente: DatosCliente & { textoSelector?: string };
    producto: ItemVenta;
    metodoPago?: MetodoPago;
}

export interface ResultadoEmision extends EmisionResult {
    numero: string;
}

export const EmitirComprobanteSimple = (datos: DatosEmisionSimple) => {
    const fn = async (page: Page): Promise<ResultadoEmision> => {
        await SeleccionarTipoComprobante(datos.tipoComprobante)(page);
        await BuscarYSeleccionarCliente(datos.cliente)(page);
        await BuscarYAgregarProducto(datos.producto)(page);

        const resultado = await ConfirmarPago(datos.metodoPago ?? 'efectivo')(page);

        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible({timeout: 15_000});
        await FacturacionTargets.btnNuevaVenta(page).click();
        await page.waitForLoadState('networkidle').catch(() => {
        });

        const numero = `${resultado.serie}-${String(resultado.correlativo).padStart(8, '0')}`;
        return {...resultado, numero};
    };
    fn.displayName = `Emitir ${datos.tipoComprobante} simple — ${datos.cliente.nombre}`;
    return fn;
};

