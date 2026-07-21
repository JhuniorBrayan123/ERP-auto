import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import {
    CrearVendedor,
    CerrarModalExitoVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {
    BuscarVendedorEnListado,
    ValidarVendedorVisible,
    AbrirAccionContextualVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {
    EditarNombreVendedor,
    ClickGuardarCambios,
} from '@screenplay/tasks/clientes-proveedores/vendedores/EditarVendedor';
import { generarVendedorRUC } from '@data/clientes-proveedores/vendedores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('VD-03 | Edición de Vendedor', { tag: ['@vendedores', '@edicion', '@VD-03'] }, () => {

    test('VD-03.1: Editar nombre de vendedor y validar en listado', async ({ vendedor, page }) => {
        const datosVendedor = generarVendedorRUC();
        const nombreEditado = `${datosVendedor.nombreRazonSocial} EDITADO`;

        // Crear vendedor
        await vendedor.realiza(CrearVendedor(datosVendedor));
        await vendedor.realiza(CerrarModalExitoVendedor());

        // Buscar y abrir edición
        await vendedor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        await vendedor.realiza(AbrirAccionContextualVendedor('Editar'));

        // Editar nombre
        await vendedor.realiza(EditarNombreVendedor(nombreEditado));
        await vendedor.realiza(ClickGuardarCambios());

        // Validar que se guardó correctamente
        const hayExito = await vendedor.pregunta(CuerpoContieneTexto('actualizado'));
        expect(hayExito).toBe(true);

        // Buscar por nombre editado
        await vendedor.realiza(BuscarVendedorEnListado(nombreEditado));
        const visible = await vendedor.pregunta(ValidarVendedorVisible(nombreEditado));
        expect(visible).toBe(true);
    });
});
