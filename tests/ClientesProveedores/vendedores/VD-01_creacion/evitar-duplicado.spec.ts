import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import {
    CrearVendedor,
    CerrarModalExitoVendedor,
    IntentarCrearVendedor,
} from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import { EliminarVendedor } from '@screenplay/tasks/clientes-proveedores/vendedores/EliminarVendedor';
import { generarVendedorDNI } from '@data/clientes-proveedores/vendedores.data';

test.describe('VD-01 | Evitar duplicado de Vendedor', { tag: ['@vendedores', '@creacion', '@duplicado'] }, () => {

    test('VD-01.3: Intentar crear vendedor duplicado muestra error', async ({ vendedorActor, page }) => {
        const datosVendedor = generarVendedorDNI();

        
        await vendedorActor.realiza(CrearVendedor(datosVendedor));
        await vendedorActor.realiza(CerrarModalExitoVendedor());

        
        await vendedorActor.realiza(IntentarCrearVendedor(datosVendedor));

        
        const hayError = await page.getByText('El código ya existe').isVisible({timeout: 5_000}).catch(() => false);
        expect(hayError).toBe(true);

        
        await page.goto('/punto-venta/entidades/vendedores');
        await page.waitForLoadState('networkidle').catch(() => {});
        await vendedorActor.realiza(EliminarVendedor(datosVendedor.numeroDocumento));
    });
});
