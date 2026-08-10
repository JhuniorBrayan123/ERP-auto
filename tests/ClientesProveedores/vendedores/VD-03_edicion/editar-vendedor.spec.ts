import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import {
    CrearVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {
    BuscarVendedorEnListado,
    ValidarVendedorVisible,
    AbrirAccionContextualVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {
    EditarNombreVendedor,
    ClickGuardarCambiosVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/EditarVendedor';
import { generarVendedorRUC } from '@data/clientes-proveedores/vendedores.data';
import { EliminarVendedor } from '@screenplay/tasks/clientes-proveedores/vendedores/EliminarVendedor';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('VD-03 | Edición de Vendedor', { tag: ['@vendedores', '@edicion', '@VD-03'] }, () => {

    test('VD-03.1: Editar nombre de vendedor y validar en listado', async ({ vendedorActor, page }) => {
        const datosVendedor = generarVendedorRUC();
        const nombreEditado = `${datosVendedor.nombreRazonSocial} EDITADO`;

        
        await vendedorActor.realiza(CrearVendedor(datosVendedor));

        
        await vendedorActor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        await vendedorActor.realiza(AbrirAccionContextualVendedor('Editar vendedor'));

        
        await vendedorActor.realiza(EditarNombreVendedor(nombreEditado));
        await vendedorActor.realiza(ClickGuardarCambiosVendedor());

        
        const hayExito = await vendedorActor.pregunta(CuerpoContieneTexto('actualizado'));
        expect(hayExito).toBe(true);

        
        await vendedorActor.realiza(BuscarVendedorEnListado(nombreEditado));
        const visible = await vendedorActor.pregunta(ValidarVendedorVisible(nombreEditado));
        expect(visible).toBe(true);

        await vendedorActor.realiza(EliminarVendedor(datosVendedor.numeroDocumento));
    });
});
