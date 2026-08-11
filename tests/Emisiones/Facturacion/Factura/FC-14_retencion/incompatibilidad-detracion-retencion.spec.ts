import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import { CLIENTES } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('FC-19 | Incompatibilidad detracción y retención', {tag: ['@facturacion', '@retencion']}, () => {

    test('SC-01: Validar que no se puedan activar detracción y retención simultáneamente @FC-19.1', async ({ page, cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYSeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
        );

        await FacturacionTargets.sliderDetraccion(page).click({ force: true });
        await page.waitForTimeout(500);

        await FacturacionTargets.sliderRetencion(page).click({ force: true });
        await page.waitForTimeout(500);

        const detraccionActiva = await FacturacionTargets.sliderDetraccion(page)
            .evaluate(el => el.classList.contains('active') || el.closest('.v-switch')?.classList.contains('active'))
            .catch(() => false);

        const retencionActiva = await FacturacionTargets.sliderRetencion(page)
            .evaluate(el => el.classList.contains('active') || el.closest('.v-switch')?.classList.contains('active'))
            .catch(() => false);

        expect(detraccionActiva && retencionActiva).toBe(false);
    });
});
