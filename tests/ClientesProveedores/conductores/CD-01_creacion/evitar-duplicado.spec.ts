import { test, expect } from '@fixtures/clientes-proveedores/conductores.fixture';
import {
    CrearConductor,
    CerrarModalExitoConductor,
    IntentarCrearConductor,
} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import { EliminarConductor } from '@screenplay/tasks/clientes-proveedores/conductores/EliminarConductor';
import { generarConductorDNI } from '@data/clientes-proveedores/conductores.data';

test.describe('CD-01 | Evitar duplicado de Conductor', { tag: ['@conductores', '@creacion', '@duplicado'] }, () => {

    test('CD-01.3: Intentar crear conductor duplicado muestra error', async ({ conductorActor, page }) => {
        const datosConductor = generarConductorDNI();

        await conductorActor.realiza(CrearConductor(datosConductor));
        await conductorActor.realiza(IntentarCrearConductor(datosConductor));

        const hayError = await page.getByText('El código ya existe').isVisible({timeout: 5_000}).catch(() => false);
        expect(hayError).toBe(true);

        
        await page.goto('/punto-venta/entidades/conductores');
        await page.waitForLoadState('networkidle').catch(() => {});
        await conductorActor.realiza(EliminarConductor(datosConductor.numeroDocumento));
    });
});
