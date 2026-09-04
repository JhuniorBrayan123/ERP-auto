import {expect, test} from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import {CrearCotizacionVF} from '@screenplay/tasks/cotizacion/CrearCotizacionVF';
import {ConvertirComprobanteDesdeDetalle} from '@screenplay/interactions/facturacion/ConvertirComprobanteDesdeDetalle';
import {ClonarComprobanteDesdeDetalle} from '@task/PuntoVenta/busqueda-comprobantes/ClonarComprobanteDesdeDetalle';
import {IrABusquedaComprobantes} from '@task/PuntoVenta/IrABusquedaComprobantes.task';
import {FiltrarComprobantePorTipo} from '@task/PuntoVenta/FiltrarComprobantePorTipo.task';
import {CAJAS, CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {esFacturadoSi} from '@helpers/PuntoVenta/busqueda-comprobantes.data';
import {ValoresColumnaFacturado} from '@question/PuntoVenta/FacturadoColumna.question';
import type {Cajero} from '@actors/cajero';
import type {Page} from '@playwright/test';

const CLIENTE = CLIENTES.EMPRESA_RUC_AUTO;
const ITEM = ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL;
const tiposComprobante = ['BOLETA', 'FACTURA', 'NOTA DE VENTA'] as const;

async function crearCotizacion(vendedor: Cajero): Promise<string> {
    const cotizacion = await vendedor.realizaYObtiene(
        CrearCotizacionVF({cliente: CLIENTE, items: [ITEM]})
    );
    expect(cotizacion.correlativo).toBeTruthy();
    return cotizacion.correlativo;
}


async function cerrarPostEmision(page: Page): Promise<void> {
    const btnNuevaVenta = page.getByRole('button', {name: 'Nueva Venta'});
    if (await btnNuevaVenta.isVisible({timeout: 1_000}).catch(() => false)) {
        await btnNuevaVenta.click({timeout: 3_000, force: true}).catch(() => {});
    }
}


async function validarFacturadoSi(vendedor: Cajero, correlativo: string): Promise<void> {
    await vendedor.realiza(
        IrABusquedaComprobantes(),
        FiltrarComprobantePorTipo('COTIZACIONES')
    );

    const valoresFacturado = await vendedor.pregunta(
        ValoresColumnaFacturado('COTIZACIONES', correlativo)
    );
    expect(
        valoresFacturado.some(esFacturadoSi),
        `La cotización ${correlativo} debería mostrar Facturado="SI" tras convertir desde detalle. ` +
        `Valores encontrados: ${JSON.stringify(valoresFacturado)}`
    ).toBe(true);
}


test.describe.serial('FC-CT-CONVERTIR | Convertir Cotización desde Ver Comprobante', {
    tag: ['@facturacion', '@cotizacion']
}, () => {

    for (const tipo of tiposComprobante) {
        test(`Convertir ${tipo} desde detalle @FC-CT.Convertir${tipo.replace(/ /g, '')}`, async ({vendedor, page}) => {
            const correlativo = await crearCotizacion(vendedor);
            await cerrarPostEmision(page);

            
            const emision = await vendedor.realizaYObtiene(
                ConvertirComprobanteDesdeDetalle(correlativo, 'COTIZACION', tipo)
            );

            if (tipo === 'BOLETA') expect(emision.serie).toMatch(/^B001/);
            if (tipo === 'FACTURA') expect(emision.serie).toMatch(/^F001/);
            if (tipo === 'NOTA DE VENTA') expect(emision.serie).toMatch(/^NV01/);

            expect(Number(emision.correlativo)).toBeGreaterThan(0);

            await validarFacturadoSi(vendedor, correlativo);
        });
    }
    test('Convertir Boleta con modo "Editar antes de emitir" @FC-CT.ConvertirEditarAntes', async ({vendedor, page}) => {
        const correlativo = await crearCotizacion(vendedor);
        await cerrarPostEmision(page);

        const emision = await vendedor.realizaYObtiene(
            ConvertirComprobanteDesdeDetalle(correlativo, 'COTIZACION', 'BOLETA', 'editar-antes')
        );

        expect(emision.serie).toMatch(/^B001/);
        expect(Number(emision.correlativo)).toBeGreaterThan(0);

        await validarFacturadoSi(vendedor, correlativo);
    });
});

test.describe('FC-CT-CLONAR | Clonar Cotización desde Ver Comprobante', {
    tag: ['@facturacion', '@cotizacion']
}, () => {

    test('Clonar cotización desde detalle hacia caja VENTA @FC-CT.ClonarDetalle', async ({vendedor, page}) => {
        const correlativo = await crearCotizacion(vendedor);
        await cerrarPostEmision(page);

        
        const popupVenta = await vendedor.realizaYObtiene(
            ClonarComprobanteDesdeDetalle.haciaCaja(correlativo, 'COTIZACION', CAJAS.VENTA.nombre)
        );

        
        await expect(popupVenta.getByRole('main')).toContainText(
            CLIENTE.nombre, {timeout: 30_000},
        );
        await expect(popupVenta.getByRole('main')).toContainText(
            ITEM.nombre,
        );
        await popupVenta.close();
    });
});


test.describe('FC-CT-BUG | Bug CT01-174 Facturado desde detalle', {
    tag: ['@facturacion', '@cotizacion']
}, () => {

    test('Bug CT01-174: Facturado="SI" tras convertir desde detalle @FC-CT.ConvertirFacturadoBug', async ({vendedor, page}) => {
        const correlativo = await crearCotizacion(vendedor);
        await cerrarPostEmision(page);

        const emision = await vendedor.realizaYObtiene(
            ConvertirComprobanteDesdeDetalle(correlativo, 'COTIZACION', 'BOLETA')
        );
        expect(emision.serie).toMatch(/^B001/);
        expect(Number(emision.correlativo)).toBeGreaterThan(0);

        await validarFacturadoSi(vendedor, correlativo);
    });
});