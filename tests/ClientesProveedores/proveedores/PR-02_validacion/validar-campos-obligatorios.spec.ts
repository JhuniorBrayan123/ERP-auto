import { test, expect } from '@fixtures/clientes-proveedores/proveedores.fixture';
import { AbrirCrearProveedor } from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import { ProveedoresTargets } from '@screenplay/targets/clientes-proveedores/ProveedoresTargets';

test.describe('PR-02 | Validación de campos obligatorios', { tag: ['@proveedores', '@validacion', '@PR-02'] }, () => {

    test('PR-02.1: Validar que nombre/razón social es obligatorio para RUC', async ({ proveedorActor, page }) => {
        await proveedorActor.realiza(AbrirCrearProveedor());

        await ProveedoresTargets.selectTipoDocumento(page).click();
        await ProveedoresTargets.opcionTipoDocumento(page, 'RUC').click();

        await ProveedoresTargets.inputNumeroDocumento(page).fill('20123456789');

        await ProveedoresTargets.btnCrearProveedorForm(page).click();
        await page.waitForTimeout(500);

        const hayError = await page.getByText(/obligatorio|requerido/i).isVisible({timeout: 3_000}).catch(() => false);
        expect(hayError).toBe(true);
    });
});
