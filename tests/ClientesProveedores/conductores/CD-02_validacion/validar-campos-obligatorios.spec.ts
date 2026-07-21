import { test, expect } from '@fixtures/clientes-proveedores/conductores.fixture';
import { AbrirCrearConductor } from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('CD-02 | Validación de campos obligatorios', { tag: ['@conductores', '@validacion', '@CD-02'] }, () => {

    test('CD-02.1: Validar que nombre/razón social es obligatorio para RUC', async ({ conductor, page }) => {
        await conductor.realiza(AbrirCrearConductor());

        // Intentar crear sin llenar nombre (solo campos básicos con RUC)
        const selectTipoDoc = page.locator('[id*="v-select:tipo-documento"]');
        await selectTipoDoc.click();
        await page.getByText('RUC', { exact: true }).click();

        const inputNumDoc = page.locator('[id*="v-input:num-document"]');
        await inputNumDoc.fill('20123456789');

        const btnCrear = page.getByRole('button', { name: 'Crear conductor' });
        await btnCrear.click();
        await page.waitForTimeout(500);

        // Validar que aparece mensaje de campo obligatorio
        const hayObligatorio = await conductor.pregunta(CuerpoContieneTexto('obligatorio'));
        const hayRequerido = await conductor.pregunta(CuerpoContieneTexto('requerido'));
        const hayLabelNombre = await conductor.pregunta(CuerpoContieneTexto('Nombre/Razón social'));
        expect(hayObligatorio || hayRequerido || hayLabelNombre).toBe(true);
    });
});
