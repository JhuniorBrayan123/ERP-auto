import {test, expect} from '@fixtures/clientes-proveedores/vendedores.fixture';
import {CrearVendedor} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {CrearYDesactivarVendedor, VerificarVendedorNoEnCaja, ActivarVendedorYVerificarEnCaja, LimpiarVendedor} from '@screenplay/tasks/cross-modules/FlujoVendedorCaja';
import {generarVendedorDNI} from '@data/clientes-proveedores/vendedores.data';
import {Page} from '@playwright/test';
import {PosTargets} from "@screenplay/targets/cross-modules/PosTargets";

test.describe('IN-04 | Integración Vendedor - Caja', {tag: ['@integracion', '@caja', '@vendedores']}, () => {

    test('SC-01: Comportamiento de vendedor inactivo y activo en datos de caja @IN-04.1', async ({vendedorActor}) => {
        
        const datos = generarVendedorDNI();
        await vendedorActor.realiza(CrearVendedor(datos));

        
        await vendedorActor.realiza(CrearYDesactivarVendedor(datos.numeroDocumento));
        await vendedorActor.realiza(VerificarVendedorNoEnCaja(datos.numeroDocumento));
        await expect(vendedorActor.pregunta(async (p: Page) => {
            const msg = await PosTargets.mensajeVendedorNoEncontrado(p);
            return msg.isVisible();
        })).toBeTruthy();
        
        
        await vendedorActor.realiza(ActivarVendedorYVerificarEnCaja(datos.numeroDocumento));
        
        await vendedorActor.realiza(LimpiarVendedor(datos.numeroDocumento));
    });
});
