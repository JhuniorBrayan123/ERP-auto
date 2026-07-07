import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { EmitirComprobanteSimple } from '@screenplay/tasks/facturacion/EmitirComprobanteSimple';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';
import { BusquedaComprobantesPage } from '@pages/PuntoVenta/BusquedaComprobantesPage';

test.describe('Facturación — Emitir Boleta Simple', () => {

    test('Emite una Boleta con cliente DNI y pago en efectivo', async ({ page, cajero }) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirComprobanteSimple({
                tipoComprobante: 'BOLETA',
                cliente: CLIENTES.PERSONA_DNI,
                producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                metodoPago: 'efectivo',
            })
        );
        expect(resultado.serie).toBe('B001');
        expect(parseInt(resultado.correlativo)).toBeGreaterThan(0);
        expect(resultado.numero).toMatch(/^B001-\d{8}$/);

        const busqueda = new BusquedaComprobantesPage(page);
        await busqueda.navegarABusquedaComprobantes(resultado);
        await expect(page.locator('body')).toContainText(resultado.numero, { timeout: 10_000 });
    });

    test('Emite una Boleta con Consumidor Final (doc 00000000)', async ({ page, cajero }) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirComprobanteSimple({
                tipoComprobante: 'BOLETA',
                cliente: CLIENTES.CONSUMIDOR_FINAL,
                producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                metodoPago: 'efectivo',
            })
        );

        expect(resultado.serie).toBe('B001');
        expect(resultado.numero).toMatch(/^B001-\d{8}$/);

        const busqueda = new BusquedaComprobantesPage(page);
        await busqueda.navegarABusquedaComprobantes(resultado);
        await expect(page.locator('body')).toContainText(resultado.numero, { timeout: 10_000 });
    });
});
