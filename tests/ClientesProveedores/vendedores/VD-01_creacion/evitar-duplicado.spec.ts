import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import {
    CrearVendedor,
    CerrarModalExitoVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {
    BuscarVendedorEnListado,
    ValidarVendedorVisible,
} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import { generarVendedorDNI } from '@data/clientes-proveedores/vendedores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('VD-01 | Evitar duplicado de Vendedor', { tag: ['@vendedores', '@creacion', '@duplicado'] }, () => {

    test('VD-01.3: Intentar crear vendedor duplicado muestra error', async ({ vendedor, page }) => {
        const datosVendedor = generarVendedorDNI();

        // Crear el vendedor la primera vez
        await vendedor.realiza(CrearVendedor(datosVendedor));
        await vendedor.realiza(CerrarModalExitoVendedor());

        // Verificar que se creó correctamente
        await vendedor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        const visible = await vendedor.pregunta(ValidarVendedorVisible(datosVendedor.nombreRazonSocial));
        expect(visible).toBe(true);

        // Intentar crear el mismo vendedor otra vez
        await vendedor.realiza(CrearVendedor(datosVendedor));

        // Validar que aparece mensaje de error por duplicado
        const hayErrorYaExiste = await vendedor.pregunta(CuerpoContieneTexto('ya existe'));
        const hayErrorDuplicado = await vendedor.pregunta(CuerpoContieneTexto('duplicado'));
        expect(hayErrorYaExiste || hayErrorDuplicado).toBe(true);
    });
});
