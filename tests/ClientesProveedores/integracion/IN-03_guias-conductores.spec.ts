import {test, expect} from '@fixtures/clientes-proveedores/conductores.fixture';
import {CrearConductor} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {BuscarConductorEnListado, AbrirAccionContextualConductor} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {ToggleSliderEstadoConductor} from '@screenplay/tasks/clientes-proveedores/conductores/ToggleEstadoConductor';
import {NavegarANuevaGuiaRemision} from '@screenplay/tasks/cross-modules/NavegarA';
import {BuscarConductorEnGuia} from '@screenplay/tasks/cross-modules/BuscarEntidadPos';
import {generarConductorDNI} from '@data/clientes-proveedores/conductores.data';
import {GuiasTargets} from '@screenplay/targets/cross-modules/GuiasTargets';
import {PosTargets} from '@screenplay/targets/cross-modules/PosTargets';

test.describe('IN-03 | Integración Conductor - Guías', {tag: ['@integracion', '@guias', '@conductores']}, () => {

    test('SC-01: Comportamiento de conductor inactivo y activo en guías @IN-03.1', async ({conductorActor, page}) => {
        // 1. Arrange: Crear conductor
        const datos = generarConductorDNI();
        await conductorActor.realiza(CrearConductor(datos));

        // 2. Act: Desactivar conductor
        await conductorActor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await conductorActor.realiza(AbrirAccionContextualConductor('Desactivar conductor'));
        await conductorActor.realiza(ToggleSliderEstadoConductor());

        // 3. Act: Navegar a Nueva Guía
        await conductorActor.realiza(NavegarANuevaGuiaRemision());

        // 4. Assert: Conductor INACTIVO no debe aparecer
        await conductorActor.realiza(BuscarConductorEnGuia(datos.numeroDocumento));
        await expect(GuiasTargets.mensajeConductorNoEncontrado(page)).toBeVisible();

        // 5. Act: Volver a Conductores y Activar
        await page.goto('/punto-venta/entidades/conductores');
        await page.waitForLoadState('networkidle').catch(() => {});
        
        await conductorActor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await conductorActor.realiza(AbrirAccionContextualConductor('Activar conductor'));
        await conductorActor.realiza(ToggleSliderEstadoConductor());

        // 6. Assert: Conductor ACTIVO debe aparecer en Guías
        await conductorActor.realiza(NavegarANuevaGuiaRemision());
        await conductorActor.realiza(BuscarConductorEnGuia(datos.numeroDocumento));
        
        await expect(PosTargets.opcionDropdownPersona(page, datos.numeroDocumento)).toBeVisible();
        await PosTargets.opcionDropdownPersona(page, datos.numeroDocumento).click();

        await expect(page.locator('main')).toContainText(datos.numeroDocumento);
    });
});
