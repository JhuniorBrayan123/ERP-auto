import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import {
    CrearVendedor,
    CerrarModalExitoVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {
    BuscarVendedorEnListado,
    ValidarSinResultados,
    AbrirAccionContextualVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {
    ClickEliminarConfirmar,
} from '@screenplay/tasks/clientes-proveedores/vendedores/EliminarVendedor';
import { generarVendedorRUC } from '@data/clientes-proveedores/vendedores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('VD-05 | Eliminación de Vendedor', { tag: ['@vendedores', '@eliminacion', '@VD-05'] }, () => {

    test('VD-05.1: Eliminar vendedor', async ({ vendedor, page }) => {
        const datosVendedor = generarVendedorRUC();

        // Crear vendedor
        await vendedor.realiza(CrearVendedor(datosVendedor));
        await vendedor.realiza(CerrarModalExitoVendedor());

        // Buscar y eliminar
        await vendedor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        await vendedor.realiza(AbrirAccionContextualVendedor('Eliminar'));
        await vendedor.realiza(ClickEliminarConfirmar());

        // Validar mensaje de éxito
        const hayExito = await vendedor.pregunta(CuerpoContieneTexto('eliminado'));
        expect(hayExito).toBe(true);

        // Validar que ya no aparece en el listado
        await vendedor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        const sinResultados = await vendedor.pregunta(ValidarSinResultados());
        expect(sinResultados).toBe(true);
    });
});
