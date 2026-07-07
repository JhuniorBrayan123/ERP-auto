import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { EmitirComprobanteSimple } from '@screenplay/tasks/facturacion/EmitirComprobanteSimple';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';
import { BusquedaComprobantesPage } from '@pages/PuntoVenta/BusquedaComprobantesPage';

test.describe('Facturación — Emitir Factura Simple', () => {

    test('Emite una Factura con empresa RUC y pago en efectivo', async ({ page, cajero }) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirComprobanteSimple({
                tipoComprobante: 'FACTURA',
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                metodoPago: 'efectivo',
            })
        );
        expect(resultado.serie).toBe('F001');
        expect(parseInt(resultado.correlativo)).toBeGreaterThan(0);
        expect(resultado.numero).toMatch(/^F001-\d{8}$/);

        const busqueda = new BusquedaComprobantesPage(page);
        await busqueda.navegarABusquedaComprobantes(resultado);
        await expect(page.locator('body')).toContainText(resultado.numero, { timeout: 10_000 });
    });
});
