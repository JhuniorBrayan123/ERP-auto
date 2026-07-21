import {expect, test} from '@fixtures/clientes-proveedores/conductores.fixture';
import {CrearConductor} from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import {
    AbrirAccionContextualConductor,
    BuscarConductorEnListado
} from '@screenplay/tasks/clientes-proveedores/conductores/BuscarConductor';
import {ToggleSliderEstadoConductor} from '@screenplay/tasks/clientes-proveedores/conductores/ToggleEstadoConductor';
import {EliminarConductor} from '@screenplay/tasks/clientes-proveedores/conductores/EliminarConductor';
import {NavegarANuevaGuiaRemision} from '@screenplay/tasks/cross-modules/NavegarA';
import {BuscarConductorEnGuia} from '@screenplay/tasks/cross-modules/BuscarEntidadPos';
import {generarConductorDNI} from '@data/clientes-proveedores/conductores.data';
import {GuiasTargets} from '@screenplay/targets/cross-modules/GuiasTargets';
import {PosTargets} from '@screenplay/targets/cross-modules/PosTargets';
import {ContinuarCajaDeVenta} from "@screenplay/tasks/clientes-proveedores/conductores/NavegarCajaGuia";

test.describe('IN-03 | Integración Conductor - Guías', {tag: ['@integracion', '@guias', '@conductores']}, () => {

    test('SC-01: Comportamiento de conductor inactivo y activo en guías @IN-03.1', async ({conductorActor, page}) => {

        const datos = generarConductorDNI();
        await conductorActor.realiza(CrearConductor(datos));


        await conductorActor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await conductorActor.realiza(AbrirAccionContextualConductor('Desactivar conductor'));
        await conductorActor.realiza(ToggleSliderEstadoConductor());


        await conductorActor.realiza(NavegarANuevaGuiaRemision());
        await conductorActor.realiza(ContinuarCajaDeVenta('Caja de venta'))

        await conductorActor.realiza(BuscarConductorEnGuia(datos.numeroDocumento));
        await expect(GuiasTargets.mensajeConductorNoEncontrado(page)).toBeVisible();


        await page.goto('/punto-venta/entidades/conductores');
        await page.waitForLoadState('networkidle').catch(() => {
        });

        await conductorActor.realiza(BuscarConductorEnListado(datos.numeroDocumento));
        await conductorActor.realiza(AbrirAccionContextualConductor('Activar conductor'));
        await conductorActor.realiza(ToggleSliderEstadoConductor());
        
        await conductorActor.realiza(NavegarANuevaGuiaRemision());
        await conductorActor.realiza(ContinuarCajaDeVenta('Caja de venta'))
        await conductorActor.realiza(BuscarConductorEnGuia(datos.numeroDocumento));

        await expect(PosTargets.opcionDropdownPersona(page, datos.numeroDocumento)).toBeVisible();
        await PosTargets.opcionDropdownPersona(page, datos.numeroDocumento).click();

        await expect(page.locator('main')).toContainText(datos.numeroDocumento);

        await page.goto('/punto-venta/entidades/conductores');
        await page.waitForLoadState('networkidle').catch(() => {
        });
        await conductorActor.realiza(EliminarConductor(datos.numeroDocumento));
    });
});
