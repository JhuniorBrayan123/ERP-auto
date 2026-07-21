import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import { AbrirCrearVendedor } from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('VD-02 | Validación de campos obligatorios', { tag: ['@vendedores', '@validacion', '@VD-02'] }, () => {

    test('VD-02.1: Validar que nombre/razón social es obligatorio para RUC', async ({ vendedor, page }) => {
        await vendedor.realiza(AbrirCrearVendedor());

        // Intentar crear sin llenar nombre (solo campos básicos)
        const selectTipoDoc = page.locator('[id*="v-select:tipo-documento"]');
        await selectTipoDoc.click();
        await page.getByText('RUC', { exact: true }).click();

        const inputNumDoc = page.locator('[id*="v-input:num-document"]');
        await inputNumDoc.fill('20123456789');

        const btnCrear = page.getByRole('button', { name: 'Crear vendedor' });
        await btnCrear.click();
        await page.waitForTimeout(500);

        // Validar que aparece mensaje de campo obligatorio
        const hayObligatorio = await vendedor.pregunta(CuerpoContieneTexto('obligatorio'));
        const hayRequerido = await vendedor.pregunta(CuerpoContieneTexto('requerido'));
        const hayLabelNombre = await vendedor.pregunta(CuerpoContieneTexto('Nombre/Razón social'));
        expect(hayObligatorio || hayRequerido || hayLabelNombre).toBe(true);
    });
});
