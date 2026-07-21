import { test, expect } from '@fixtures/clientes-proveedores/proveedores.fixture';
import {
    CrearProveedor,
    CerrarModalExitoProveedor,
} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import {
    BuscarProveedorEnListado,
} from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import {
    ToggleEstadoProveedor,
} from '@screenplay/tasks/clientes-proveedores/proveedores/ToggleEstadoProveedor';
import { generarProveedorRUC } from '@data/clientes-proveedores/proveedores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('PR-04 | Desactivar / Activar Proveedor', { tag: ['@proveedores', '@estado', '@PR-04'] }, () => {

    test('PR-04.1: Desactivar proveedor', async ({ proveedor, page }) => {
        const datosProveedor = generarProveedorRUC();

        // Crear proveedor
        await proveedor.realiza(CrearProveedor(datosProveedor));
        await proveedor.realiza(CerrarModalExitoProveedor());

        // Buscar y desactivar
        await proveedor.realiza(BuscarProveedorEnListado(datosProveedor.numeroDocumento));
        await proveedor.realiza(ToggleEstadoProveedor('Desactivar proveedor'));

        // Validar mensaje de éxito
        const hayExito = await proveedor.pregunta(CuerpoContieneTexto('desactivado'));
        expect(hayExito).toBe(true);
    });

    test('PR-04.2: Activar proveedor', async ({ proveedor, page }) => {
        const datosProveedor = generarProveedorRUC();

        // Crear proveedor
        await proveedor.realiza(CrearProveedor(datosProveedor));
        await proveedor.realiza(CerrarModalExitoProveedor());

        // Buscar y desactivar primero
        await proveedor.realiza(BuscarProveedorEnListado(datosProveedor.numeroDocumento));
        await proveedor.realiza(ToggleEstadoProveedor('Desactivar proveedor'));

        // Buscar y activar
        await proveedor.realiza(BuscarProveedorEnListado(datosProveedor.numeroDocumento));
        await proveedor.realiza(ToggleEstadoProveedor('Activar proveedor'));

        // Validar mensaje de éxito
        const hayExito = await proveedor.pregunta(CuerpoContieneTexto('activado'));
        expect(hayExito).toBe(true);
    });
});
