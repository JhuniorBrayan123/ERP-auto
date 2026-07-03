
import { expect } from '@playwright/test';
import { test } from '@fixtures/PuntoVenta/caja.fixture';
import { IrACierreDeCaja } from '@screenplay/tasks/caja/IrACierreDeCaja';
import { RegresarANuevaVenta } from '@screenplay/tasks/caja/AbrirMenuCaja';
import { MenuCajaTargets } from '@screenplay/targets/caja/MenuCajaTargets';
import {
    ConsultarAnulaciones,
    BuscarAnulacionEnCierre,
    AnularComprobanteDesdeMenu,
} from '@screenplay/tasks/cierre-caja/ConsultarAnulaciones';
import { AnulacionesNCTargets } from '@screenplay/targets/cierre-caja/AnulacionesNCTargets';
import { UsarNavegador } from '@abilities/usarnavegador';

test.describe('Anulaciones y Notas de Crédito en Cierre de Caja', () => {
    test.describe.configure({ mode: 'serial' });

    test('anular boleta y verificar que aparece como DADO DE BAJA en cierre de caja', async ({
        cajero,
        boletaEmitida,
    }) => {
        
        const comprobante = boletaEmitida;
        const page = cajero.habilidad(UsarNavegador).page;

        
        await MenuCajaTargets.btnAbrirMenu(page).click();
        await MenuCajaTargets.opcionAnularComprobante(page).click();

        await cajero.realiza(
            AnularComprobanteDesdeMenu({
                tipoComprobante: 'BOLETA DE VENTA',
                serie: comprobante.serie,
                correlativo: String(parseInt(comprobante.correlativo)),
                motivoAnulacion: 'Comprobante duplicado',
            }),
        );

        
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarAnulaciones(),
            BuscarAnulacionEnCierre({
                tipoDocumento: 'Boleta',
                correlativo: String(parseInt(comprobante.correlativo)),
            }),
        );

        
        await expect(AnulacionesNCTargets.estadoDadoDeBaja(page)).toBeVisible({ timeout: 10_000 });

        await cajero.realiza(RegresarANuevaVenta());
    });

    test('anular factura y verificar que aparece como DADO DE BAJA en cierre de caja', async ({
        cajero,
        facturaEmitida,
    }) => {
        
        const comprobante = facturaEmitida;
        const page = cajero.habilidad(UsarNavegador).page;

        
        await MenuCajaTargets.btnAbrirMenu(page).click();
        await MenuCajaTargets.opcionAnularComprobante(page).click();

        await cajero.realiza(
            AnularComprobanteDesdeMenu({
                tipoComprobante: 'FACTURA',
                serie: comprobante.serie,
                correlativo: String(parseInt(comprobante.correlativo)),
                motivoAnulacion: 'Error de datos',
            }),
        );

        
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarAnulaciones(),
            BuscarAnulacionEnCierre({
                tipoDocumento: 'Factura',
                correlativo: String(parseInt(comprobante.correlativo)),
            }),
        );

        
        await expect(AnulacionesNCTargets.estadoDadoDeBaja(page)).toBeVisible({ timeout: 10_000 });

        await cajero.realiza(RegresarANuevaVenta());
    });
});
