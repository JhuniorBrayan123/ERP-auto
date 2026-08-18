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

/** Crea una cotización base propia por test (una CT solo se convierte UNA vez). */
async function crearCotizacion(vendedor: Cajero): Promise<string> {
    const cotizacion = await vendedor.realizaYObtiene(
        CrearCotizacionVF({cliente: CLIENTE, items: [ITEM]})
    );
    expect(cotizacion.correlativo).toBeTruthy();
    return cotizacion.correlativo;
}

/** Cierra el modal post-emisión ("Nueva Venta") si quedó visible. No-bloqueante:
 * el modal puede auto-cerrarse tras la emisión; si ya no está, no debe fallar. */
async function cerrarPostEmision(page: Page): Promise<void> {
    const btnNuevaVenta = page.getByRole('button', {name: 'Nueva Venta'});
    if (await btnNuevaVenta.isVisible({timeout: 1_000}).catch(() => false)) {
        await btnNuevaVenta.click({timeout: 3_000, force: true}).catch(() => {});
    }
}

/**
 * Validación integrada: tras convertir la Cotización desde detalle, la cotización
 * origen DEBE mostrar Facturado = "SI"/"Sí" en Búsqueda de Comprobantes. Si el
 * producto muestra "No", el test FALLA y evidencia el bug CT01-174 (no se
 * silencia ni se hace skip).
 */
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

// Los tests de conversión crean su PROPIA cotización (una CT solo se convierte
// una vez) → no comparten setup → se desacoplan de la cascada serial de
// Clonar/bug (cada describe es independiente).
test.describe.serial('FC-CT-CONVERTIR | Convertir Cotización desde Ver Comprobante', {
    tag: ['@facturacion', '@cotizacion']
}, () => {

    for (const tipo of tiposComprobante) {
        test(`Convertir ${tipo} desde detalle @FC-CT.Convertir${tipo.replace(/ /g, '')}`, async ({vendedor, page}) => {
            const correlativo = await crearCotizacion(vendedor);
            await cerrarPostEmision(page);

            // Camino C: Ver Comprobante → "Convertir a" → tipo destino → pago → EmisionResult
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

    // Segundo camino del wizard de conversión (decisión D7 del design): en vez de
    // "Emitir ahora" (misma popup), "Editar antes de emitir" abre una ventana nueva
    // con la lista de cajas y paga desde la caja cargada.
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

        // Clonar desde Ver Comprobante → caja VENTA → se abre venta con datos del origen
        const popupVenta = await vendedor.realizaYObtiene(
            ClonarComprobanteDesdeDetalle.haciaCaja(correlativo, 'COTIZACION', CAJAS.VENTA.nombre)
        );

        // Datos transferidos (patrón BC-21.1): cliente + item visibles en el popup de emisión
        await expect(popupVenta.getByRole('main')).toContainText(
            CLIENTE.nombre, {timeout: 30_000},
        );
        await expect(popupVenta.getByRole('main')).toContainText(
            ITEM.nombre,
        );
        await popupVenta.close();
    });
});

// Caso bug CT01-174 (B001-631): convertir la cotización DESDE EL DETALLE
// (Camino C) deja la columna Facturado en "No" en Búsqueda de Comprobantes.
// Este test crea su PROPIA cotización y espera Facturado="SI"; si el producto
// muestra "No", el test FALLA y evidencia el bug. NO se hace skip ni se
// silencia: es la evidencia automatizada del defecto. Independiente de la
// cascada serial de los Convertir*/Clonar.
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