import { test, expect } from '../../../src/fixtures/Logistica/items-fixture';
import { buildUniqueItemName } from '../../../src/helpers/Logistica/unique-name.helper';

test.describe('Creación de Servicios',{ tag: ['@logistica'] }, () => {

  test('crear servicio gravado', async ({ servicioForm, itemDetail }) => {
    const nombre = buildUniqueItemName('servicio', 'gravado');

    await test.step('Iniciar creación de servicio', async () => {
      await servicioForm.iniciarCreacionServicio();
    });

    await test.step('Llenar datos básicos', async () => {
      await servicioForm.llenarNombre(nombre);
      await servicioForm.llenarPrecios('15', '51');
    });

    await test.step('Configurar información adicional', async () => {
      await servicioForm.expandirOpcionesAvanzadasServicio();
      await servicioForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
    });

    await test.step('Crear servicio y confirmar', async () => {
      await servicioForm.crearServicio();
      await expect(servicioForm['page'].getByRole('button', { name: 'Ir a lista de ítems' }))
        .toBeVisible();
      await servicioForm.clickIrAListaItems();
    });

    await test.step('Verificar bitácora', async () => {
      await itemDetail.verificarItemDesdeMenu({ verificarBitacora: true });
    });
  });


  test('crear servicio exonerado', async ({ servicioForm, itemDetail }) => {
    const nombre = buildUniqueItemName('servicio', 'exonerado');

    await test.step('Iniciar creación de servicio', async () => {
      await servicioForm.iniciarCreacionServicio();
    });

    await test.step('Llenar datos básicos con tipo exonerado', async () => {
      await servicioForm.llenarNombre(nombre);
      await servicioForm.seleccionarTipoAfectacionIGV('Exonerado (No paga IGV)');
      await servicioForm.llenarPrecios('20', '20');
    });

    await test.step('Configurar información adicional', async () => {
      await servicioForm.expandirOpcionesAvanzadas();
      await servicioForm.irATabInfoAdicional();

      // Para servicio exonerado, usar el patrón del codegen
      const page = servicioForm['page'];
      await page
        .locator(`.subcategoria > ${servicioForm['DROPDOWN_ARROW']}`)
        .first()
        .click();
      await page.getByText('REGRESION').click();

      await page
        .locator(`div:nth-child(2) > ${servicioForm['DROPDOWN_ARROW']}`)
        .click();
      await page.getByText('AUTO-TEST').click();

      await page
        .locator(`div:nth-child(3) > ${servicioForm['DROPDOWN_ARROW']}`)
        .click();
      await page.getByText('AUTOMATIZADO').click();
    });

    await test.step('Crear servicio y confirmar', async () => {
      await servicioForm.crearServicio();
      await expect(servicioForm['page'].getByRole('button', { name: 'Ir a lista de ítems' }))
        .toBeVisible();
      await servicioForm.clickIrAListaItems();
    });

    await test.step('Verificar bitácora', async () => {
      await itemDetail.verificarItemDesdeMenu({ verificarBitacora: true });
    });
  });
});
