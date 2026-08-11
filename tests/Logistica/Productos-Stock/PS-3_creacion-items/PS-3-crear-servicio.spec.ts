import {test} from '@fixtures/Logistica/items-fixture';
import {buildUniqueItemName} from '@helpers/Logistica/unique-name.helper';
import {confirmarCreacionEIrALista} from '@helpers/Logistica/verificaciones-items.helper';

test.describe('PS-03 | Creación de Servicios', {tag: ['@logistica', '@productos-stock']}, () => {

    test('SC-01: crear servicio gravado @PS-03.1', async ({servicioForm, itemDetail}) => {
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

        await confirmarCreacionEIrALista(servicioForm, () => servicioForm.crearServicio());

        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });

    test('SC-02: crear servicio exonerado @PS-03.2', async ({servicioForm, itemDetail}) => {
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

            const page = servicioForm['page'];
            await page
                .locator(`.subcategoria > ${servicioForm['DROPDOWN_ARROW']}`)
                .first()
                .click();
            await page.waitForTimeout(500);
            await page.getByText('REGRESION').click({force: true});

            await page.waitForTimeout(500);

            await page
                .locator(`div:nth-child(2) > ${servicioForm['DROPDOWN_ARROW']}`)
                .click({force: true});
            await page.waitForTimeout(500);
            await page.getByText('AUTO-TEST').click({force: true});

            await page.waitForTimeout(500);

            await page
                .locator(`div:nth-child(3) > ${servicioForm['DROPDOWN_ARROW']}`)
                .click({force: true});
            await page.waitForTimeout(500);
            await page.getByText('AUTOMATIZADO').click({force: true});
        });

        await confirmarCreacionEIrALista(servicioForm, () => servicioForm.crearServicio());

        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });
});
