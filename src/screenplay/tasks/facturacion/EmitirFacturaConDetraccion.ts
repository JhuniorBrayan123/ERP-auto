import {expect, type Page} from '@playwright/test';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {BuscarYSeleccionarCliente} from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import {BuscarYAgregarProducto} from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import {SeleccionarMoneda} from '@screenplay/interactions/facturacion/SeleccionarMoneda';
import {FacturacionTargets} from '@screenplay/targets/facturacion/FacturacionTargets';
import {PagoTargets} from '@screenplay/targets/facturacion/PagoTargets';
import {VentaGridTargets} from '@screenplay/targets/facturacion/VentaGridTargets';
import {type ConfigDetraccionTransporte, DetraccionPage} from '@pages/PuntoVenta/detraccion.page';
import type {DatosCliente, ItemVenta} from '@helpers/PuntoVenta/emision.types';
import type {ResultadoEmision} from './EmitirComprobanteSimple';

type Moneda = 'soles' | 'dolares' | 'euros';

interface ProductoConPrecio extends ItemVenta {
    precioFinal?: string;
}

export interface DatosDetraccionSimple {
    cliente: DatosCliente & { textoSelector?: string };
    productos: ProductoConPrecio[];
    detraccion: {
        porcentaje: string;
        numeroCuenta: string;
    };
    moneda?: Moneda;
    tipoCambioExtranjera?: string;
}

export interface DatosDetraccionTransporte {
    cliente: DatosCliente & { textoSelector?: string };
    productos: ProductoConPrecio[];
    transporte: ConfigDetraccionTransporte;
    moneda?: Moneda;
    tipoCambioExtranjera?: string;
}

const ejecutarPago = async (page: Page): Promise<ResultadoEmision> => {
    const emisionPromise = page.waitForResponse(
        (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
        {timeout: 45_000}
    );
    await page.getByRole('button', {name: 'PAGAR'}).click();
    await PagoTargets.btnMontoExacto(page).click();
    await PagoTargets.btnRealizarPago(page).click();

    const response = await emisionPromise;
    const body = await response.json();
    const nombrePdf: string = body.FilePdf?.Nombre ?? '';
    const serie = nombrePdf.split('-')[0] ?? '';
    const correlativo = String(body.CorrelativoDocumento ?? '');
    const comprobanteId = body.IdComprobante ?? 0;

    await expect(FacturacionTargets.mensajeExito(page)).toBeVisible({timeout: 15_000});
    await FacturacionTargets.btnNuevaVenta(page).click();
    await page.waitForLoadState('networkidle').catch(() => {
    });
    const numero = `${serie}-${correlativo.padStart(8, '0')}`;
    return {serie, correlativo, comprobanteId, numero};
};

const agregarProductosConPrecio = async (page: Page, productos: ProductoConPrecio[]): Promise<void> => {
    for (let i = 0; i < productos.length; i++) {
        await BuscarYAgregarProducto(productos[i])(page);
        if (productos[i].precioFinal) {
            await VentaGridTargets.btnEditarItem(page, i).click();
            await VentaGridTargets.inputPrecioFinal(page, i).fill(productos[i].precioFinal!);
            await VentaGridTargets.btnAceptarEdicion(page, i).click();
        }
    }
};

const DETRACCION_CHECKBOX_ID = 'pv_punto-venta_cmp-factura-boleta-header_v-switch:documento-detraccion';

const activarDetraccion = async (page: Page): Promise<void> => {
    const isChecked = await page.evaluate((id) => {
        const el = document.getElementById(id) as HTMLInputElement;
        return el?.checked ?? false;
    }, DETRACCION_CHECKBOX_ID);

    if (!isChecked) {
        await page.evaluate((id) => {
            const el = document.getElementById(id) as HTMLInputElement;
            if (el && !el.checked) {
                el.checked = true;
                el.dispatchEvent(new Event('change', {bubbles: true}));
            }
        }, DETRACCION_CHECKBOX_ID);
        await page.waitForTimeout(500);
    }
};

export const EmitirFacturaConDetraccion = (datos: DatosDetraccionSimple) => {
    const fn = async (page: Page): Promise<ResultadoEmision> => {
        await SeleccionarTipoComprobante('FACTURA')(page);
        await BuscarYSeleccionarCliente(datos.cliente)(page);
        if (datos.moneda && datos.moneda !== 'soles') {
            await SeleccionarMoneda(datos.moneda)(page);
        }

        await agregarProductosConPrecio(page, datos.productos);

        await activarDetraccion(page);


        if (datos.tipoCambioExtranjera) {
            await expect(page.getByText('Tipo de cambio de detracción')).toBeVisible({timeout: 5_000});
            const input = page.getByRole('textbox', {name: 'Cambio'}).or(page.getByRole('textbox', {name: '0'}));
            if (await input.isVisible().catch(() => false)) {
                await input.fill(datos.tipoCambioExtranjera);
            }
        }

        await FacturacionTargets.btnEditarDetraccion(page).click();

        const detraccionPage = new DetraccionPage(page);
        await detraccionPage.configurarDetraccionSimple(datos.detraccion);

        return ejecutarPago(page);
    };
    fn.displayName = `Emitir Factura con Detracción — ${datos.detraccion.porcentaje}%`;
    return fn;
};

export const EmitirFacturaConDetraccionTransporte = (datos: DatosDetraccionTransporte) => {
    const fn = async (page: Page): Promise<ResultadoEmision> => {
        await SeleccionarTipoComprobante('FACTURA')(page);
        await BuscarYSeleccionarCliente(datos.cliente)(page);
        if (datos.moneda && datos.moneda !== 'soles') {
            await SeleccionarMoneda(datos.moneda)(page);
        }

        await agregarProductosConPrecio(page, datos.productos);

        await activarDetraccion(page);

        if (datos.tipoCambioExtranjera) {
            await expect(page.getByText('Tipo de cambio de detracción')).toBeVisible({timeout: 5_000});
            const input = page.getByRole('textbox', {name: 'Cambio'}).or(page.getByRole('textbox', {name: '0'}));
            if (await input.isVisible().catch(() => false)) {
                await input.fill(datos.tipoCambioExtranjera);
            }
        }

        await FacturacionTargets.btnEditarDetraccion(page).click();

        const detraccionPage = new DetraccionPage(page);
        await detraccionPage.configurarTransporteCarga(datos.transporte);

        return ejecutarPago(page);
    };
    fn.displayName = 'Emitir Factura con Detracción — Transporte de Carga';
    return fn;
};

