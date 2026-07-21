import { test, expect } from '@fixtures/clientes-proveedores/proveedores.fixture';
import {
    CrearProveedor,
    CerrarModalExitoProveedor,
} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {
    BuscarProveedorEnListado,
    ValidarSinResultados,
    AbrirAccionContextualProveedor,
} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {
    ClickEliminarConfirmar,
} from '@screenplay/tasks/clientes-proveedores/proveedores/EliminarProveedor';
import { generarProveedorRUC } from '@data/clientes-proveedores/proveedores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('PR-05 | Eliminación de Proveedor', { tag: ['@proveedores', '@eliminacion', '@PR-05'] }, () => {

    test('PR-05.1: Eliminar proveedor', async ({ proveedor, page }) => {
        const datosProveedor = generarProveedorRUC();

        // Crear proveedor
        await proveedor.realiza(CrearProveedor(datosProveedor));
        await proveedor.realiza(CerrarModalExitoProveedor());

        // Buscar y eliminar
        await proveedor.realiza(BuscarProveedorEnListado(datosProveedor.numeroDocumento));
        await proveedor.realiza(AbrirAccionContextualProveedor('Eliminar'));
        await proveedor.realiza(ClickEliminarConfirmar());

        // Validar mensaje de éxito
        const hayExito = await proveedor.pregunta(CuerpoContieneTexto('eliminado'));
        expect(hayExito).toBe(true);

        // Validar que ya no aparece en el listado
        await proveedor.realiza(BuscarProveedorEnListado(datosProveedor.numeroDocumento));
        const sinResultados = await proveedor.pregunta(ValidarSinResultados());
        expect(sinResultados).toBe(true);
    });
});
