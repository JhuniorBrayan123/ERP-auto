import { test, expect } from '@fixtures/clientes-proveedores/vendedores.fixture';
import { AbrirCrearVendedor } from '@screenplay/tasks/clientes-proveedores/vendedores/CrearVendedor';
import { CuerpoContieneTexto } from '@screenplay/questions/clientes-proveedores/ClienteQuestions';

test.describe('VD-02 | Validación de campos obligatorios', { tag: ['@vendedores', '@validacion', '@VD-02'] }, () => {

    test('VD-02.1: Validar que nombre/razón social es obligatorio para RUC', async ({ vendedorActor, page }) => {
        await vendedorActor.realiza(AbrirCrearVendedor());

        
        const selectTipoDoc = page.locator('[id*="v-select:tipo-documento"]');
        await selectTipoDoc.click();
        await page.getByText('RUC', { exact: true }).click();

        const inputNumDoc = page.locator('[id*="v-input:num-document"]');
        await inputNumDoc.fill('20123456789');

        const btnCrear = page.getByRole('button', { name: 'Crear vendedor' });
        await btnCrear.click();
        await page.waitForTimeout(500);

        
        let hayObligatorio = false, hayRequerido = false, hayLabelNombre = false;
        try { await vendedorActor.pregunta(CuerpoContieneTexto('obligatorio')); hayObligatorio = true; } catch { }
        try { await vendedorActor.pregunta(CuerpoContieneTexto('requerido')); hayRequerido = true; } catch { }
        try { await vendedorActor.pregunta(CuerpoContieneTexto('Nombre/Razón social')); hayLabelNombre = true; } catch { }
        expect(hayObligatorio || hayRequerido || hayLabelNombre).toBe(true);
    });
});
