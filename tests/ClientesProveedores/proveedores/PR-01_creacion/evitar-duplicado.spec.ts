import { test, expect } from '@fixtures/clientes-proveedores/proveedores.fixture';
import {
    CrearProveedor,
    CerrarModalExitoProveedor,
    IntentarCrearProveedor,
} from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import { EliminarProveedor } from '@screenplay/tasks/clientes-proveedores/proveedores/EliminarProveedor';
import { generarProveedorRUC } from '@data/clientes-proveedores/proveedores.data';

test.describe('PR-01 | Evitar duplicado de Proveedor', { tag: ['@proveedores', '@creacion', '@duplicado'] }, () => {

    test('PR-01.3: Intentar crear proveedor duplicado muestra error', async ({ proveedorActor, page }) => {
        const datosProveedor = generarProveedorRUC();

        
        await proveedorActor.realiza(CrearProveedor(datosProveedor));
        await proveedorActor.realiza(CerrarModalExitoProveedor());

        
        await proveedorActor.realiza(IntentarCrearProveedor(datosProveedor));

        
        const hayError = await page.getByText('El código ya existe').isVisible({timeout: 5_000}).catch(() => false);
        expect(hayError).toBe(true);

        
        await page.goto('/punto-venta/entidades/proveedores');
        await page.waitForLoadState('networkidle').catch(() => {});
        await proveedorActor.realiza(EliminarProveedor(datosProveedor.numeroDocumento));
    });
});
