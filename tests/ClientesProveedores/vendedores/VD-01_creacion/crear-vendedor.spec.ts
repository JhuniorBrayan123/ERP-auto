import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import {
    CrearVendedor,
    CerrarModalExitoVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {
    BuscarVendedorEnListado,
    ValidarVendedorVisible,
} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import { EliminarVendedor } from '@screenplay/tasks/clientes-proveedores/vendedores/EliminarVendedor';
import { generarVendedorDNI, generarVendedorConCodigoManual } from '@data/clientes-proveedores/vendedores.data';

test.describe('VD-01 | Creación de Vendedores', { tag: ['@vendedores', '@creacion', '@VD-01'] }, () => {

    test('VD-01.1: Crear vendedor con DNI', async ({ vendedorActor, page }) => {
        const datosVendedor = generarVendedorDNI();

        await vendedorActor.realiza(CrearVendedor(datosVendedor));

        
        const modalVisible = await page.locator('[id*="modal-exito"]').isVisible();
        expect(modalVisible).toBe(true);

        await vendedorActor.realiza(CerrarModalExitoVendedor());

        
        await vendedorActor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        const visible =         await vendedorActor.pregunta(ValidarVendedorVisible(datosVendedor.nombreRazonSocial));
        expect(visible).toBe(true);

        await vendedorActor.realiza(EliminarVendedor(datosVendedor.numeroDocumento));
    });

    test('VD-01.2: Crear vendedor con código manual', async ({ vendedorActor, page }) => {
        const datosVendedor = generarVendedorConCodigoManual();

        await vendedorActor.realiza(CrearVendedor(datosVendedor));

        
        const modalVisible = await page.locator('[id*="modal-exito"]').isVisible();
        expect(modalVisible).toBe(true);

        await vendedorActor.realiza(CerrarModalExitoVendedor());

        
        await vendedorActor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        const visible =         await vendedorActor.pregunta(ValidarVendedorVisible(datosVendedor.nombreRazonSocial));
        expect(visible).toBe(true);

        await vendedorActor.realiza(EliminarVendedor(datosVendedor.numeroDocumento));
    });
});
