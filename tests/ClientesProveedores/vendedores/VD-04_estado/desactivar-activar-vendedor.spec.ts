import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import {
    CrearVendedor,
    CerrarModalExitoVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {
    BuscarVendedorEnListado,
} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import {
    ToggleSliderEstadoVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/ToggleEstadoVendedor';
import { generarVendedorRUC } from '@data/clientes-proveedores/vendedores.data';
import { EliminarVendedor } from '@screenplay/tasks/clientes-proveedores/vendedores/EliminarVendedor';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('VD-04 | Desactivar / Activar Vendedor', { tag: ['@vendedores', '@estado', '@VD-04'] }, () => {

    test('VD-04.1: Desactivar vendedor', async ({ vendedorActor, page }) => {
        const datosVendedor = generarVendedorRUC();

        
        await vendedorActor.realiza(CrearVendedor(datosVendedor));
        await vendedorActor.realiza(CerrarModalExitoVendedor());

        
        await vendedorActor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        await vendedorActor.realiza(ToggleSliderEstadoVendedor('Desactivar vendedor'));

        
        const hayExito = await vendedorActor.pregunta(CuerpoContieneTexto('desactivado'));
        expect(hayExito).toBe(true);

        await vendedorActor.realiza(EliminarVendedor(datosVendedor.numeroDocumento));
    });

    test('VD-04.2: Activar vendedor', async ({ vendedorActor, page }) => {
        const datosVendedor = generarVendedorRUC();

        
        await vendedorActor.realiza(CrearVendedor(datosVendedor));
        await vendedorActor.realiza(CerrarModalExitoVendedor());

        
        await vendedorActor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        await vendedorActor.realiza(ToggleSliderEstadoVendedor('Desactivar vendedor'));

        
        await vendedorActor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        await vendedorActor.realiza(ToggleSliderEstadoVendedor('Activar vendedor'));

        
        const hayExito = await vendedorActor.pregunta(CuerpoContieneTexto('activado'));
        expect(hayExito).toBe(true);

        await vendedorActor.realiza(EliminarVendedor(datosVendedor.numeroDocumento));
    });
});
