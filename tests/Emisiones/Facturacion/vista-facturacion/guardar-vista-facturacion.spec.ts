import {expect, test} from '@fixtures/PuntoVenta/facturacion.fixture';
import {ConfigurarVistaFacturacion} from '@screenplay/tasks/facturacion/ConfigurarVistaFacturacion';
import {VistaFacturacionActiva} from '@screenplay/questions/facturacion/VistaFacturacionActiva';

test.describe.configure({mode: 'serial'});

test.describe('Vista Facturación — Guardar configuración', () => {

    test('Puede guardar Vista Facturación y queda activa', async ({cajero}) => {
        await cajero.realiza(
            ConfigurarVistaFacturacion()
        );
        const estaActiva = await cajero.pregunta(VistaFacturacionActiva());
        expect(estaActiva).toBe(true);
    });

    test('Vista Facturación persiste al recargar la página', async ({page, cajero}) => {
        await page.reload();
        await page.waitForLoadState('networkidle');

        const estaActiva = await cajero.pregunta(VistaFacturacionActiva());
        expect(estaActiva).toBe(true);
    });
});
