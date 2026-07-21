import { test, expect } from '@fixtures/clientes-proveedores/proveedores.fixture';
import {
    CrearProveedor,
    CerrarModalExitoProveedor,
} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import { BuscarProveedorEnListado, ValidarProveedorVisible } from '@screenplay/tasks/clientes-proveedores/proveedores/BuscarProveedor';
import { generarProveedorRUC } from '@data/clientes-proveedores/proveedores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('PR-01 | Evitar duplicado de Proveedor', { tag: ['@proveedores', '@creacion', '@duplicado'] }, () => {

    test('PR-01.3: Intentar crear proveedor duplicado muestra error', async ({ proveedor, page }) => {
        const datosProveedor = generarProveedorRUC();

        // Crear el proveedor la primera vez
        await proveedor.realiza(CrearProveedor(datosProveedor));
        await proveedor.realiza(CerrarModalExitoProveedor());

        // Verificar que se creó correctamente
        await proveedor.realiza(BuscarProveedorEnListado(datosProveedor.numeroDocumento));
        const visible = await proveedor.pregunta(ValidarProveedorVisible(datosProveedor.nombreRazonSocial));
        expect(visible).toBe(true);

        // Intentar crear el mismo proveedor otra vez
        await proveedor.realiza(CrearProveedor(datosProveedor));

        // Validar que aparece mensaje de error por duplicado
        const hayErrorYaExiste = await proveedor.pregunta(CuerpoContieneTexto('ya existe'));
        const hayErrorDuplicado = await proveedor.pregunta(CuerpoContieneTexto('duplicado'));
        expect(hayErrorYaExiste || hayErrorDuplicado).toBe(true);
    });
});
