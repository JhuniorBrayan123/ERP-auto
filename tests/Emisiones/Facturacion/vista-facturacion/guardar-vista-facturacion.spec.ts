import {expect, test} from '@fixtures/PuntoVenta/caja.fixture';
import {ConfigurarVistaFacturacion} from '@screenplay/tasks/facturacion/ConfigurarVistaFacturacion';
import {VistaFacturacionActiva} from '@screenplay/questions/facturacion/VistaFacturacionActiva';
import {FacturacionTargets} from '@screenplay/targets/facturacion/FacturacionTargets';

test.describe('FC-21 | Guardar configuración de Vista Facturación', {tag: ['@facturacion', '@vista-facturacion']}, () => {

    test('SC-01: Guardar Vista Facturación y persiste al recargar @FC-21.1', async ({page, cajero}) => {
        // 1. Guardar la configuración en DB
        await cajero.realiza(
            ConfigurarVistaFacturacion()
        );
        let estaActiva = await cajero.pregunta(VistaFacturacionActiva());
        expect(estaActiva).toBe(true);

        // 2. Recargar para validar la persistencia
        await page.reload();
        await page.waitForLoadState('networkidle');

        estaActiva = await cajero.pregunta(VistaFacturacionActiva());
        expect(estaActiva).toBe(true);

        // 3. Limpieza: Restauramos a la vista por defecto para no afectar otros tests
        await FacturacionTargets.btnCambiarVista(page).click();
        await FacturacionTargets.opcionVistaCuadrada(page).click();
        
        await page.waitForTimeout(500);
        await FacturacionTargets.btnGuardarVista(page).click({ force: true });
        
        await expect(FacturacionTargets.mensajeVistaGuardada(page)).toBeVisible({ timeout: 10_000 });
        await FacturacionTargets.btnCerrarModal(page).click();
    });

});
