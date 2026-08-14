import {expect, test} from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import {CrearPedidoVF} from '@screenplay/tasks/pedido/CrearPedidoVF';
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

/** Crea un pedido base propio por test (un pedido solo se convierte UNA vez). */
async function crearPedido(vendedor: Cajero): Promise<string> {
    const pedido = await vendedor.realizaYObtiene(
        CrearPedidoVF({cliente: CLIENTE, items: [ITEM]})
    );
    const numeroPedido = String(parseInt(pedido.correlativo, 10));
    expect(numeroPedido).toBeTruthy();
    return numeroPedido;
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
 * Validación integrada: tras convertir el Pedido desde detalle, el pedido origen
 * DEBE mostrar Facturado = "SI"/"Sí" en Búsqueda de Comprobantes. Si el producto
 * muestra "No", el test FALLA y evidencia el bug B001-631 (no se silencia ni se
 * hace skip).
 */
async function validarFacturadoSi(vendedor: Cajero, numeroPedido: string): Promise<void> {
    await vendedor.realiza(
        IrABusquedaComprobantes(),
        FiltrarComprobantePorTipo('PEDIDOS')
    );

    const valoresFacturado = await vendedor.pregunta(
        ValoresColumnaFacturado('PEDIDOS', numeroPedido)
    );
    expect(
        valoresFacturado.some(esFacturadoSi),
        `El pedido ${numeroPedido} debería mostrar Facturado="SI" tras convertir desde detalle. ` +
        `Valores encontrados: ${JSON.stringify(valoresFacturado)}`
    ).toBe(true);
}

// Los tests de conversión crean su PROPIO pedido (un pedido solo se convierte
// una vez) → no comparten setup → se desacoplan de la cascada serial de Clonar
// (cada describe es independiente).
test.describe.serial('FC-PD-CONVERTIR | Convertir Pedido desde Ver Comprobante', {
    tag: ['@facturacion', '@pedido']
}, () => {

    for (const tipo of tiposComprobante) {
        test(`Convertir ${tipo} desde detalle @FC-PD.Convertir${tipo.replace(/ /g, '')}`, async ({vendedor, page}) => {
            const numeroPedido = await crearPedido(vendedor);
            await cerrarPostEmision(page);

            // Camino C: Ver Comprobante → "Convertir a" → tipo destino → pago → EmisionResult
            const emision = await vendedor.realizaYObtiene(
                ConvertirComprobanteDesdeDetalle(numeroPedido, 'PEDIDO', tipo)
            );

            if (tipo === 'BOLETA') expect(emision.serie).toMatch(/^B001/);
            if (tipo === 'FACTURA') expect(emision.serie).toMatch(/^F001/);
            if (tipo === 'NOTA DE VENTA') expect(emision.serie).toMatch(/^NV01/);

            expect(Number(emision.correlativo)).toBeGreaterThan(0);

            await validarFacturadoSi(vendedor, numeroPedido);
        });
    }

    // Segundo camino del wizard de conversión (decisión D7 del design): en vez de
    // "Emitir ahora" (misma popup), "Editar antes de emitir" abre una ventana nueva
    // con la lista de cajas y paga desde la caja cargada.
    test('Convertir Boleta con modo "Editar antes de emitir" @FC-PD.ConvertirEditarAntes', async ({vendedor, page}) => {
        const numeroPedido = await crearPedido(vendedor);
        await cerrarPostEmision(page);

        const emision = await vendedor.realizaYObtiene(
            ConvertirComprobanteDesdeDetalle(numeroPedido, 'PEDIDO', 'BOLETA', 'editar-antes')
        );

        expect(emision.serie).toMatch(/^B001/);
        expect(Number(emision.correlativo)).toBeGreaterThan(0);

        await validarFacturadoSi(vendedor, numeroPedido);
    });
});

test.describe('FC-PD-CLONAR | Clonar Pedido desde Ver Comprobante', {
    tag: ['@facturacion', '@pedido']
}, () => {

    test('Clonar pedido desde detalle hacia caja VENTA @FC-PD.ClonarDetalle', async ({vendedor, page}) => {
        const numeroPedido = await crearPedido(vendedor);
        await cerrarPostEmision(page);

        // Clonar desde Ver Comprobante → caja VENTA → se abre venta con datos del origen
        const popupVenta = await vendedor.realizaYObtiene(
            ClonarComprobanteDesdeDetalle.haciaCaja(numeroPedido, 'PEDIDO', CAJAS.VENTA.nombre)
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