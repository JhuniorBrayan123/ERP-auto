import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import {
    CrearVendedor,
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

    test('VD-05.1: Eliminar vendedor', async ({ vendedorActor, page }) => {
        const datosVendedor = generarVendedorRUC();

        
        await vendedorActor.realiza(CrearVendedor(datosVendedor));

        
        await vendedorActor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        await vendedorActor.realiza(AbrirAccionContextualVendedor('Eliminar vendedor'));
        await vendedorActor.realiza(ClickEliminarConfirmar());

        
        const hayExito = await vendedorActor.pregunta(CuerpoContieneTexto('eliminado'));
        expect(hayExito).toBe(true);

        
        await vendedorActor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        const sinResultados = await vendedorActor.pregunta(ValidarSinResultados());
        expect(sinResultados).toBe(true);
    });
});
