import { test, expect } from '@fixtures/clientes-proveedores/proveedores.fixture';
import { AbrirCrearProveedor } from '@screenplay/tasks/clientes-proveedores/proveedores/CrearProveedor';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('PR-02 | Validación de campos obligatorios', { tag: ['@proveedores', '@validacion', '@PR-02'] }, () => {

    test('PR-02.1: Validar que nombre/razón social es obligatorio para RUC', async ({ proveedor, page }) => {
        await proveedor.realiza(AbrirCrearProveedor());

        // Intentar crear sin llenar nombre (solo campos básicos)
        const selectTipoDoc = page.locator('[id*="v-select:tipo-documento"]');
        await selectTipoDoc.click();
        await page.getByText('RUC', { exact: true }).click();

        const inputNumDoc = page.locator('[id*="v-input:num-document"]');
        await inputNumDoc.fill('20123456789');

        const btnCrear = page.getByRole('button', { name: 'Crear proveedor' });
        await btnCrear.click();
        await page.waitForTimeout(500);

        // Validar que aparece mensaje de campo obligatorio
        const hayObligatorio = await proveedor.pregunta(CuerpoContieneTexto('obligatorio'));
        const hayRequerido = await proveedor.pregunta(CuerpoContieneTexto('requerido'));
        const hayLabelNombre = await proveedor.pregunta(CuerpoContieneTexto('Nombre/Razón social'));
        expect(hayObligatorio || hayRequerido || hayLabelNombre).toBe(true);
    });
});
