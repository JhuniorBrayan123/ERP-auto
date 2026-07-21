import { test, expect } from '@fixtures/clientes-proveedores/proveedores.fixture';
import {
    CrearProveedor,
    CerrarModalExitoProveedor,
} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {
    BuscarProveedorEnListado,
    ValidarProveedorVisible,
    AbrirAccionContextualProveedor,
} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {
    EditarNombreProveedor,
    ClickGuardarCambios,
} from '@screenplay/tasks/clientes-proveedores/proveedores/EditarProveedor';
import { generarProveedorRUC } from '@data/clientes-proveedores/proveedores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('PR-03 | Edición de Proveedor', { tag: ['@proveedores', '@edicion', '@PR-03'] }, () => {

    test('PR-03.1: Editar nombre de proveedor y validar en bitácora', async ({ proveedor, page }) => {
        const datosProveedor = generarProveedorRUC();
        const nombreEditado = `${datosProveedor.nombreRazonSocial} EDITADO`;

        // Crear proveedor
        await proveedor.realiza(CrearProveedor(datosProveedor));
        await proveedor.realiza(CerrarModalExitoProveedor());

        // Buscar y abrir edición
        await proveedor.realiza(BuscarProveedorEnListado(datosProveedor.numeroDocumento));
        await proveedor.realiza(AbrirAccionContextualProveedor('Editar'));

        // Editar nombre
        await proveedor.realiza(EditarNombreProveedor(nombreEditado));
        await proveedor.realiza(ClickGuardarCambios());

        // Validar que se guardó correctamente
        const hayExito = await proveedor.pregunta(CuerpoContieneTexto('actualizado'));
        expect(hayExito).toBe(true);

        // Buscar por nombre editado
        await proveedor.realiza(BuscarProveedorEnListado(nombreEditado));
        const visible = await proveedor.pregunta(ValidarProveedorVisible(nombreEditado));
        expect(visible).toBe(true);
    });
});
