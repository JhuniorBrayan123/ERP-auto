
import { expect } from '@playwright/test';
import { test } from '@fixtures/PuntoVenta/caja.fixture';
import { IrACierreDeCaja } from '@screenplay/tasks/caja/IrACierreDeCaja';
import { RegresarANuevaVenta } from '@screenplay/tasks/caja/AbrirMenuCaja';
import {
    ConsultarDescuentos,
    BuscarDescuentoPorCorrelativo,
} from '@screenplay/tasks/cierre-caja/ConsultarItemsYDescuentos';
import { DescuentosTargets } from '@screenplay/targets/cierre-caja/ItemsVendidosTargets';
import { UsarNavegador } from '@abilities/usarnavegador';
import { EmisionPage } from '@pages/PuntoVenta/EmisionPage';
import { ClientePage } from '@pages/PuntoVenta/ClientePage';
import { ComprobantePage } from '@pages/PuntoVenta/ComprobantePage';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('CC-04 | Descuentos', {tag: ['@cierre-caja']}, () => {

    test('SC-01: Validar comprobante con descuento global aparece en pestaña Descuentos @CC-04.1', async ({ cajero, page }) => {
        
        const emisionPage = new EmisionPage(page);
        const clientePage = new ClientePage(page);
        const comprobantePage = new ComprobantePage(page);

        await comprobantePage.seleccionarTipoComprobante('BOLETA');
        await clientePage.buscarCliente(CLIENTES.PERSONA_DNI.documento);
        await clientePage.seleccionarClientePorTexto(CLIENTES.PERSONA_DNI.nombre);
        await emisionPage.buscarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.codigo);
        await emisionPage.seleccionarItem(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);

        
        await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]').click();
        await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:descuento"]').fill('10');
        await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]').click();

        
        await emisionPage.abrirDescuentoGlobal();
        
        await page.locator('.v-popup').locator('.preaddon-select').first().click();
        
        await page.getByText('Monto', { exact: true }).last().click();
        
        await emisionPage.llenarDescuentoGlobal('2.5');
        await emisionPage.aplicarDescuentoGlobal();

        
        const resultado = await emisionPage.emitirConEfectivoExacto();
        await emisionPage.clickNuevaVenta();

        const correlativo = resultado.correlativo;

        
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarDescuentos(),
            BuscarDescuentoPorCorrelativo(correlativo),
        );

        
        await expect(
            DescuentosTargets.textoTotalDescuentoGlobal(page),
        ).toBeVisible({ timeout: 10_000 });

        await expect(
            page.getByText(/Total descuento global.*S\/ 2\.50/i, { exact: false }),
        ).toBeVisible();

        await cajero.realiza(RegresarANuevaVenta());
    });
});
