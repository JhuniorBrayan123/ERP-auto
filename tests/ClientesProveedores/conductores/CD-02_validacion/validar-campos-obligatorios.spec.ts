import { test, expect } from '@fixtures/clientes-proveedores/conductores.fixture';
import { AbrirCrearConductor } from '@screenplay/tasks/clientes-proveedores/conductores/CrearConductor';
import { ConductoresTargets } from '@screenplay/targets/clientes-proveedores/ConductoresTargets';

test.describe('CD-02 | Validación de campos obligatorios', { tag: ['@conductores', '@validacion', '@CD-02'] }, () => {

    test('CD-02.1: Validar que nombre/razón social es obligatorio para RUC', async ({ conductorActor, page }) => {
        await conductorActor.realiza(AbrirCrearConductor());

        await ConductoresTargets.selectTipoDocumento(page).click();
        await ConductoresTargets.opcionTipoDocumento(page, 'RUC').click();

        await ConductoresTargets.inputNumeroDocumento(page).fill('20123456789');

        await ConductoresTargets.btnCrearConductorForm(page).click();
        await page.waitForTimeout(500);

        const hayError = await page.getByText(/obligatorio|requerido/i).isVisible({timeout: 3_000}).catch(() => false);
        expect(hayError).toBe(true);
    });
});
