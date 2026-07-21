import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import {
    CrearVendedor,
    CerrarModalExitoVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import {
    BuscarVendedorEnListado,
    ValidarVendedorVisible,
} from '@screenplay/tasks/clientes-proveedores/vendedores/BuscarVendedor';
import { generarVendedorDNI, generarVendedorConCodigoManual } from '@data/clientes-proveedores/vendedores.data';

test.describe('VD-01 | Creación de Vendedores', { tag: ['@vendedores', '@creacion', '@VD-01'] }, () => {

    test('VD-01.1: Crear vendedor con DNI', async ({ vendedor, page }) => {
        const datosVendedor = generarVendedorDNI();

        await vendedor.realiza(CrearVendedor(datosVendedor));

        // Validar modal de éxito
        const modalVisible = await page.locator('[id*="modal-exito"]').isVisible();
        expect(modalVisible).toBe(true);

        await vendedor.realiza(CerrarModalExitoVendedor());

        // Buscar y validar en listado
        await vendedor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        const visible = await vendedor.pregunta(ValidarVendedorVisible(datosVendedor.nombreRazonSocial));
        expect(visible).toBe(true);
    });

    test('VD-01.2: Crear vendedor con código manual', async ({ vendedor, page }) => {
        const datosVendedor = generarVendedorConCodigoManual();

        await vendedor.realiza(CrearVendedor(datosVendedor));

        // Validar modal de éxito
        const modalVisible = await page.locator('[id*="modal-exito"]').isVisible();
        expect(modalVisible).toBe(true);

        await vendedor.realiza(CerrarModalExitoVendedor());

        // Buscar y validar en listado
        await vendedor.realiza(BuscarVendedorEnListado(datosVendedor.numeroDocumento));
        const visible = await vendedor.pregunta(ValidarVendedorVisible(datosVendedor.nombreRazonSocial));
        expect(visible).toBe(true);
    });
});
