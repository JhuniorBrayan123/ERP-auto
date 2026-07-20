import {expect, test} from '@fixtures/clientes-proveedores/proveedores.fixture';
import {CrearProveedor, LlenarFormularioBasicoProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {BuscarProveedorEnListado} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {EliminarProveedor} from '@screenplay/tasks/clientes-proveedores/proveedores/EliminarProveedor';
import {CancelarCreacion} from '@screenplay/tasks/clientes-proveedores/proveedores/EditarProveedor';
import {
    MensajeCampoObligatorioVisible,
    ProveedorVisibleEnListado,
} from '@screenplay/questions/clientes-proveedores/ProveedorQuestions';
import {generarProveedorDNI, generarProveedorRUC} from '@data/clientes-proveedores/proveedores.data';
import {ProveedoresTargets} from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

test.describe('PR-01 | Creación de Proveedores', {tag: ['@proveedores', '@creacion']}, () => {

    test('SC-01: Crear proveedor válido con DNI @PR-01.1', async ({proveedorActor}) => {

        const datos = generarProveedorDNI();
        await proveedorActor.realiza(CrearProveedor(datos));
        await proveedorActor.realiza(BuscarProveedorEnListado(datos.numeroDocumento));
        await proveedorActor.realiza(ProveedorVisibleEnListado(datos.nombreRazonSocial));

        await proveedorActor.realiza(EliminarProveedor(datos.numeroDocumento));
    });

    test('SC-02: Validar campos obligatorios al crear proveedor @PR-01.2', async ({proveedorActor, page}) => {

        const datos = generarProveedorRUC();
        datos.numeroDocumento = ''; // Forzamos vacío
        datos.nombreRazonSocial = '';

        await ProveedoresTargets.btnCrearProveedor(page).click();
        await proveedorActor.realiza(LlenarFormularioBasicoProveedor(datos));
        await ProveedoresTargets.btnCrearProveedorForm(page).click();
        await proveedorActor.realiza(MensajeCampoObligatorioVisible());
        await ProveedoresTargets.inputNumeroDocumento(page).click();
        await ProveedoresTargets.inputNumeroDocumento(page).fill('41');
        await ProveedoresTargets.btnCrearProveedorForm(page).click();

        await expect(page.locator('body')).toContainText('Debe ingresar 11 dígitos');
        await proveedorActor.realiza(CancelarCreacion());
    });
});
