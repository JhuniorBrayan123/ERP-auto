import {test, expect} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {CrearProveedor, CerrarModalExito, LlenarFormularioBasicoProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {BuscarProveedorEnListado} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {CancelarCreacion} from '@screenplay/tasks/clientes-proveedores/proveedores/EditarProveedor';
import {
    ProveedorVisibleEnListado,
    MensajeCreacionExitosaVisible,
    MensajeCampoObligatorioVisible,
} from '@screenplay/questions/clientes-proveedores/ProveedorQuestions';
import {generarProveedorDNI, generarProveedorRUC} from '@data/clientes-proveedores/proveedores.data';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

test.describe('PR-01 | Creación de Proveedores', {tag: ['@proveedores', '@creacion']}, () => {

    test('SC-01: Crear proveedor válido con DNI @PR-01.1', async ({proveedorActor}) => {
        // Arrange
        const datos = generarProveedorDNI();

        // Act
        await proveedorActor.realiza(CrearProveedor(datos));

        // Assert: Mensaje de éxito
        await proveedorActor.realiza(MensajeCreacionExitosaVisible());
        await proveedorActor.realiza(CerrarModalExito());

        // Assert: Visualización en listado
        await proveedorActor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await proveedorActor.realiza(ProveedorVisibleEnListado(datos.nombreRazonSocial));
    });

    test('SC-02: Validar campos obligatorios al crear proveedor @PR-01.2', async ({proveedorActor, page}) => {
        // Arrange: Datos parciales
        const datos = generarProveedorRUC();
        datos.numeroDocumento = ''; // Forzamos vacío
        datos.nombreRazonSocial = '';

        // Act
        await ProveedoresTargets.btnCrearProveedor(page).click();
        await proveedorActor.realiza(LlenarFormularioBasicoProveedor(datos));
        await ProveedoresTargets.btnCrearProveedorForm(page).click();

        // Assert: Validaciones de campos vacíos
        await proveedorActor.realiza(MensajeCampoObligatorioVisible());

        // Act: Llenar documento con formato inválido y verificar
        await ProveedoresTargets.inputNumeroDocumento(page).click();
        await ProveedoresTargets.inputNumeroDocumento(page).fill('41');
        await ProveedoresTargets.btnCrearProveedorForm(page).click();

        // Assert: Formato inválido
        await expect(page.locator('body')).toContainText('Debe ingresar 11 dígitos'); // Porque elegimos RUC en generarProveedorRUC

        // Teardown
        await proveedorActor.realiza(CancelarCreacion());
    });
});
