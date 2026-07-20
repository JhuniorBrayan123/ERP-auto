import {test} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {CerrarModalExito, CrearProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {
    AbrirAccionContextualProveedor,
    BuscarProveedorEnListado
} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {EliminarProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/EliminarProveedor';
import {
    ClickGuardarCambiosProveedor,
    EditarNombreProveedor
} from '@screenplay/tasks/clientes-proveedores/proveedores/EditarProveedor';
import {
    BitacoraContieneAccion,
    MensajeEdicionExitosaVisible,
    ProveedorVisibleEnListado,
} from '@screenplay/questions/clientes-proveedores/ProveedorQuestions';
import {generarProveedorRUC} from '@data/clientes-proveedores/proveedores.data';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

test.describe('PR-02 | Edición de Proveedores', {tag: ['@proveedores', '@edicion']}, () => {

    test('SC-01: Editar razón social y estado del proveedor @PR-02.1', async ({proveedorActor, page}) => {

        const datos = generarProveedorRUC();
        await proveedorActor.realiza(CrearProveedor(datos));
        await proveedorActor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));

        await proveedorActor.realiza(AbrirAccionContextualProveedor('Editar proveedor'));
        const nombreEditado = `${datos.nombreRazonSocial}-editado`;
        await proveedorActor.realiza(EditarNombreProveedor(nombreEditado));

        await proveedorActor.realiza(ClickGuardarCambiosProveedor());

        await proveedorActor.realiza(MensajeEdicionExitosaVisible());
        await proveedorActor.realiza(CerrarModalExito());

        await proveedorActor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await proveedorActor.realiza(ProveedorVisibleEnListado(nombreEditado));

        await proveedorActor.realiza(AbrirAccionContextualProveedor('Ver bitácora'));
        await ProveedoresTargets.pestaniaBitacora(page, 'Actualización').click();
        await proveedorActor.realiza(BitacoraContieneAccion(`ahora: ${nombreEditado}`));
        await ProveedoresTargets.btnCerrarDrape(page).click();

        await proveedorActor.realiza(EliminarProveedor(datos.numeroDocumento));
    });
});
