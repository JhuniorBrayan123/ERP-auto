import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { EmitirComprobanteSimple } from '@screenplay/tasks/facturacion/EmitirComprobanteSimple';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';
import { BusquedaComprobantesPage } from '@pages/PuntoVenta/BusquedaComprobantesPage';

test.describe('Facturación — Emitir Nota de Venta Simple', () => {

    test('Emite una Nota de Venta con cliente DNI', async ({ page, cajero }) => {
        const resultado = await cajero.realizaYObtiene(
            EmitirComprobanteSimple({
                tipoComprobante: 'NOTA DE VENTA',
                cliente: CLIENTES.PERSONA_DNI,
                producto: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
                metodoPago: 'efectivo',
            })
        );
        expect(resultado.serie).toBe('NV01');
        expect(resultado.numero).toMatch(/^NV01-\d{8}$/);

        const busqueda = new BusquedaComprobantesPage(page);
        await busqueda.navegarABusquedaComprobantes(resultado);
        await expect(page.locator('body')).toContainText(resultado.numero, { timeout: 10_000 });
    });
});
