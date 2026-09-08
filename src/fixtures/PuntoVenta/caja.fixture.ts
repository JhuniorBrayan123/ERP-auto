import {test as base, expect} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {CajaPage} from '@pages/PuntoVenta/CajaPage';
import {PuntoVentaNavigationPage} from '@pages/PuntoVenta/PuntoVentaNavigationPage';
import {CAJAS, CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {EmisionPage} from '@pages/PuntoVenta/EmisionPage';
import {ClientePage} from '@pages/PuntoVenta/ClientePage';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import type {ResultadoComprobanteOrigen} from '@screenplay/tasks/common/EmitirComprobanteOrigen';
import {EmitirComprobanteOrigen} from '@screenplay/tasks/common/EmitirComprobanteOrigen';
import {esperarCargaOverlaySiVisible} from "@utils/wait-helpers";



type CajaFixtures = {
    cajero: Cajero;
    cajaAbierta: void;
    boletaEmitida: ResultadoComprobanteOrigen;
    facturaEmitida: ResultadoComprobanteOrigen;
    ventaCreditoBoleta: ResultadoComprobanteOrigen;
    ventaCreditoFactura: ResultadoComprobanteOrigen;
};


export const test = base.extend<CajaFixtures>({

    cajero: async ({page, cajaAbierta: _}, use) => {
        await use(Cajero.con(page));
    },
    cajaAbierta: [async ({page}, use) => {
        const pvNav = new PuntoVentaNavigationPage(page);
        await page.goto('/');
        await pvNav.navegarAPuntoDeVenta();

        const cajaPage = new CajaPage(page, CAJAS.VENTA.nombre);
        await cajaPage.asegurarCajaAbierta();

        await use();
    }, {auto: true}],

    boletaEmitida: async ({page}, use) => {
        const resultado = await EmitirComprobanteOrigen({
            tipoComprobante: 'BOLETA',
            cliente: CLIENTES.PERSONA_DNI,
            item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
        })(page);

        await use(resultado);
    },

    facturaEmitida: async ({page}, use) => {
        const resultado = await EmitirComprobanteOrigen({
            tipoComprobante: 'FACTURA',
            cliente: CLIENTES.EMPRESA_RUC_AUTO,
            item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
        })(page);

        await use(resultado);
    },

        ventaCreditoBoleta: async ({page}, use) => {
        const emisionPage = new EmisionPage(page);
        const clientePage = new ClientePage(page);
        const comprobantePage = new ComprobantePage(page);

        await comprobantePage.seleccionarTipoComprobante('FACTURA');
        await clientePage.buscarCliente(CLIENTES.EMPRESA_RUC_AUTO.documento);
        await clientePage.seleccionarClientePorTexto(CLIENTES.EMPRESA_RUC_AUTO.textoSelector!);
        await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
        await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);

        
        await page.getByRole('button', {name: /PAGAR/i}).click();
        await page.locator('[id="pv_ventas_cmp-punto-venta_v-modal:cmp-realizar-pago_cmp-metodos-pago_v-button:otros-metodos-1"]').click();
        
        await page.locator('[id="pv_ventas_cmp-punto-venta_v-modal:cmp-realizar-pago:cmp-informacion-pago:cmp-pago-credito_v-button:guardar"]').click();
        
        await page.locator('[id="pv_ventas_cmp-punto-venta_v-modal:cmp-realizar-pago:cmp-informacion-pago:cmp-pago-credito_v-button:guardar"]').click();
        const responsePromise = page.waitForResponse(
            (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            {timeout: 30_000}
        );

        await page.getByRole('button', {name: /Realizar Pago/i}).click();

        
        const response = await responsePromise;
        const body = await response.json();
        const correlativo = String(body.CorrelativoDocumento ?? '0');
        const nombrePdf = body.FilePdf?.Nombre ?? '';
        const serie = nombrePdf.split('-')[0] || 'B001';

        await expect(page.getByText('¡Buen trabajo!')).toBeVisible({ timeout: 15000 });
        await emisionPage.clickNuevaVenta();

        await use({
            serie,
            correlativo,
            comprobanteId: 0,
            numero: `${serie}-${correlativo}`,
        });
    },

        ventaCreditoFactura: async ({page}, use) => {
        const emisionPage = new EmisionPage(page);
        const clientePage = new ClientePage(page);
        const comprobantePage = new ComprobantePage(page);

        await comprobantePage.seleccionarTipoComprobante('FACTURA');
        await clientePage.buscarCliente(CLIENTES.EMPRESA_RUC_AUTO.documento);
        await clientePage.seleccionarClientePorTexto(CLIENTES.EMPRESA_RUC_AUTO.textoSelector!);
        await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
        await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);

        await page.getByRole('button', {name: /PAGAR/i}).click();
        await page.locator('[id="pv_ventas_cmp-punto-venta_v-modal:cmp-realizar-pago_cmp-metodos-pago_v-button:otros-metodos-1"]').click();
        
        await page.locator('[id="pv_ventas_cmp-punto-venta_v-modal:cmp-realizar-pago:cmp-informacion-pago:cmp-pago-credito_v-button:guardar"]').click();
        
        await page.locator('[id="pv_ventas_cmp-punto-venta_v-modal:cmp-realizar-pago:cmp-informacion-pago:cmp-pago-credito_v-button:guardar"]').click();
        const responsePromise = page.waitForResponse(
            (resp) => resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            {timeout: 30_000}
        );

        await page.getByRole('button', {name: /Realizar Pago/i}).click();

        
        const response = await responsePromise;
        const body = await response.json();
        const correlativo = String(body.CorrelativoDocumento ?? '0');
        const nombrePdf = body.FilePdf?.Nombre ?? '';
        const serie = nombrePdf.split('-')[0] || 'F001';

        await expect(page.getByText('¡Buen trabajo!')).toBeVisible({ timeout: 15000 });
        await emisionPage.clickNuevaVenta();

        await esperarCargaOverlaySiVisible(page);
        await use({
            serie,
            correlativo,
            comprobanteId: 0,
            numero: `${serie}-${correlativo}`,
        });
    },
});

test.afterEach(async ({}, testInfo) => {
    const status = testInfo.status === 'passed' ? '✓ PASS' : '✗ FAIL';
    const duracion = ((testInfo.duration ?? 0) / 1000).toFixed(1);
    const mensaje = `${status}: ${testInfo.title} (${duracion}s)`;

    if (testInfo.status !== 'passed' && testInfo.error) {
        console.log(`${mensaje}\n  → ${testInfo.error.message}`);
    } else {
        console.log(mensaje);
    }
});

export {expect} from '@playwright/test';
