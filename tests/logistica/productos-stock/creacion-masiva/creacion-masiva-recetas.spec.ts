import {expect, test} from '@fixtures/Logistica/masivos-fixture';
import {MASIVO_CONFIG} from '@helpers/Logistica/masivo-config.helper';
import {buildMassiveExcel, cleanupTempFile} from '@helpers/Logistica/masivo-excel.helper';

const CONFIG = MASIVO_CONFIG.recetas;

test.describe('Carga masiva de recetas desde Excel', {tag: ['@logistica', '@productos-stock']}, () => {

    test('crear recetas masivamente desde excel', async ({
                                                             page,
                                                             cargaMasiva,
                                                         }) => {
        let tempFilePath = '';
        let textoBusqueda = '';

        await test.step('Preparar Excel con nombre único', async () => {
            const result = await buildMassiveExcel('recetas', 'masivo');
            tempFilePath = result.tempFilePath;
            textoBusqueda = result.textoBusqueda;
            console.log(`  → Nombre generado: ${result.nombreGenerado}`);
        });

        await test.step('Seleccionar tipo Recetas y subir archivo', async () => {
            await cargaMasiva.ejecutarFlujoCargaMasiva(CONFIG.cardLabel, tempFilePath);
        });

        await test.step('Verificar que la carga finalizó correctamente', async () => {
            await expect(page.getByRole('button', {name: 'Ir al inicio'})).toBeVisible({
                timeout: 30_000,
            });
        });

        await test.step('Volver al inicio', async () => {
            await cargaMasiva.clickIrAlInicio();
        });

        await test.step('Verificar item creado buscando por nombre en la lista', async () => {
            await page.getByRole('textbox', {name: 'Buscar por nombre, código o c'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, código o c'}).fill(textoBusqueda);
            await page
                .locator('[id="lgt_items_cmp-filtro-items:filtro:filtro_section_v-input:button_search"]')
                .click();
            await page.waitForLoadState('networkidle');

            await expect(
                page.getByRole('table').getByText(textoBusqueda).first(),
            ).toBeAttached({timeout: 15_000});
        });

        cleanupTempFile(tempFilePath);
    });
});
