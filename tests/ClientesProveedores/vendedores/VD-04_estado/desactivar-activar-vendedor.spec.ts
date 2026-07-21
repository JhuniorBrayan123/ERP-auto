import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import {
    CrearVendedor,
    CerrarModalExitoVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {
    BuscarVendedorEnListado,
} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {
    ToggleEstadoVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/ToggleEstadoVendedor';
import { generarVendedorRUC } from '@data/clientes-proveedores/vendedores.data';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('VD-04 | Desactivar / Activar Vendedor', { tag: ['@vendedores', '@estado', '@VD-04'] }, () => {

    test('VD-04.1: Desactivar vendedor', async ({ vendedor, page }) => {
        const datosVendedor = generarVendedorRUC();

        // Crear vendedor
        await vendedor.realiza(CrearVendedor(datosVendedor));
        await vendedor.realiza(CerrarModalExitoVendedor());

        // Buscar y desactivar
        await vendedor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        await vendedor.realiza(ToggleEstadoVendedor('Desactivar vendedor'));

        // Validar mensaje de éxito
        const hayExito = await vendedor.pregunta(CuerpoContieneTexto('desactivado'));
        expect(hayExito).toBe(true);
    });

    test('VD-04.2: Activar vendedor', async ({ vendedor, page }) => {
        const datosVendedor = generarVendedorRUC();

        // Crear vendedor
        await vendedor.realiza(CrearVendedor(datosVendedor));
        await vendedor.realiza(CerrarModalExitoVendedor());

        // Buscar y desactivar primero
        await vendedor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        await vendedor.realiza(ToggleEstadoVendedor('Desactivar vendedor'));

        // Buscar y activar
        await vendedor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        await vendedor.realiza(ToggleEstadoVendedor('Activar vendedor'));

        // Validar mensaje de éxito
        const hayExito = await vendedor.pregunta(CuerpoContieneTexto('activado'));
        expect(hayExito).toBe(true);
    });
});
