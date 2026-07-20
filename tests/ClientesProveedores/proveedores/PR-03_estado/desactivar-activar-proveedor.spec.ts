import {test, expect} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {CrearProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {BuscarProveedorEnListado, AbrirAccionContextualProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {EliminarProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/EliminarProveedor';
import {ToggleSliderEstadoProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/ToggleEstadoProveedor';
import {
    EstadoProveedorEnListado,
    BitacoraContieneAccion,
} from '@screenplay/questions/clientes-proveedores/ProveedorQuestions';
import {generarProveedorDNI} from '@data/clientes-proveedores/proveedores.data';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

test.describe('PR-03 | Estado de Proveedores', {tag: ['@proveedores', '@estado']}, () => {

    test('SC-01: Desactivar y reactivar proveedor @PR-03.1', async ({proveedorActor, page}) => {
        
        const datos = generarProveedorDNI();
        await proveedorActor.realiza(CrearProveedor(datos));

        
        await proveedorActor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await proveedorActor.realiza(AbrirAccionContextualProveedor('Desactivar proveedor'));
        await proveedorActor.realiza(ToggleSliderEstadoProveedor());

        
        await proveedorActor.realiza(EstadoProveedorEnListado('INACTIVO'));

        
        await proveedorActor.realiza(AbrirAccionContextualProveedor('Activar proveedor'));
        await proveedorActor.realiza(ToggleSliderEstadoProveedor());
        await proveedorActor.realiza(EstadoProveedorEnListado('ACTIVO'));

        
        await proveedorActor.realiza(AbrirAccionContextualProveedor('Ver bitácora'));
        await ProveedoresTargets.pestaniaBitacora(page, 'Actualización').click();
        await proveedorActor.realiza(BitacoraContieneAccion('Desactivar proveedor'));
        
        await ProveedoresTargets.btnCerrarDrape(page).click();

        
        await proveedorActor.realiza(EliminarProveedor(datos.numeroDocumento));
    });
});
