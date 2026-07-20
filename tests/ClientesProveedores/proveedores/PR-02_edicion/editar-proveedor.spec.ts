import {test, expect} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {CrearProveedor, CerrarModalExito} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {BuscarProveedorEnListado, AbrirAccionContextualProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {EditarNombreProveedor, CambiarEstadoProveedorEnFormulario, ClickGuardarCambiosProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/EditarProveedor';
import {
    ProveedorVisibleEnListado,
    MensajeEdicionExitosaVisible,
    BitacoraContieneAccion,
} from '@screenplay/questions/clientes-proveedores/ProveedorQuestions';
import {generarProveedorRUC} from '@data/clientes-proveedores/proveedores.data';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

test.describe('PR-02 | Edición de Proveedores', {tag: ['@proveedores', '@edicion']}, () => {

    test('SC-01: Editar razón social y estado del proveedor @PR-02.1', async ({proveedorActor, page}) => {
        // Arrange
        const datos = generarProveedorRUC();
        await proveedorActor.realiza(CrearProveedor(datos));
        await proveedorActor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));

        // Act
        await proveedorActor.realiza(AbrirAccionContextualProveedor('Editar proveedor'));

        const nombreEditado = `${datos.nombreRazonSocial}-editado`;
        await proveedorActor.realiza(EditarNombreProveedor(nombreEditado));
        
        // Asumimos que por defecto nace Activo, podemos probar forzar un cambio pero para no romper
        // el flujo del Codegen, probaremos solo la edición de nombre y guardado.
        await proveedorActor.realiza(ClickGuardarCambiosProveedor());

        // Assert: Mensaje de éxito
        await proveedorActor.realiza(MensajeEdicionExitosaVisible());
        await proveedorActor.realiza(CerrarModalExito());

        // Assert: Nombre actualizado en listado
        await proveedorActor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await proveedorActor.realiza(ProveedorVisibleEnListado(nombreEditado));

        // Assert: Bitácora
        await proveedorActor.realiza(AbrirAccionContextualProveedor('Ver bitácora'));
        await ProveedoresTargets.pestaniaBitacora(page, 'Actualización').click();
        await proveedorActor.realiza(BitacoraContieneAccion(`ahora: ${nombreEditado}`));
        await ProveedoresTargets.btnCerrarDrape(page).click();
    });
});
