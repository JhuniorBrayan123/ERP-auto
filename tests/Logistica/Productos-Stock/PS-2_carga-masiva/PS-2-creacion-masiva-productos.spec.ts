import {expect, test} from '@fixtures/Logistica/masivos-fixture';
import {MASIVO_CONFIG} from '@helpers/Logistica/masivo-config.helper';
import {buildMassiveExcel, cleanupTempFile} from '@helpers/Logistica/masivo-excel.helper';

const CONFIG = MASIVO_CONFIG.productos;

test.describe('PS-2 | Carga masiva de productos desde Excel', {tag: ['@logistica', '@productos-stock']}, () => {

    /**
     * Escenario: crear productos masivamente subiendo un Excel con nombre único.
     *
     * Flujo:
     * 1. Preparar Excel temporal con nombre único (columna DESCRIPCION para productos)
     * 2. Seleccionar tipo "Productos" por card ID estable
     * 3. Subir archivo → asignar columnas → seleccionar almacenes
     * 4. Procesar carga
     * 5. Verificar que el flujo finaliza correctamente
     * 6. Volver al inicio y buscar el item creado por nombre
     */
    test('crear productos masivamente desde excel @PS-2', async ({
                                                               page,
                                                               cargaMasiva,
                                                           }) => {
        let tempFilePath = '';
        let textoBusqueda = '';

        await test.step('Preparar Excel con nombre único', async () => {
            const result = await buildMassiveExcel('productos', 'masivo');
            tempFilePath = result.tempFilePath;
            textoBusqueda = result.textoBusqueda;
            console.log(`  → Nombre generado: ${result.nombreGenerado}`);
        });

        await test.step('Seleccionar tipo Productos y subir archivo con auto-remapeo', async () => {
            await cargaMasiva.ejecutarFlujoCargaMasivaProductosConAutoRemapeo(CONFIG.cardLabel, tempFilePath);
        });

        await test.step('Verificar que la carga finalizó correctamente', async () => {
            // Esperar a que aparezca el botón "Ir al inicio" que confirma la carga exitosa
            await expect(page.getByRole('button', {name: 'Ir al inicio'})).toBeVisible({
                timeout: 30_000,
            });
        });

        await test.step('Volver al inicio', async () => {
            await cargaMasiva.clickIrAlInicio();
        });

        await test.step('Verificar item creado buscando por nombre en la lista', async () => {
            // Buscar por el nombre generado en el buscador de la lista
            await page.getByRole('textbox', {name: 'Buscar por nombre, código o c'}).click();
            await page.getByRole('textbox', {name: 'Buscar por nombre, código o c'}).fill(textoBusqueda);
            await page
                .locator('[id="lgt_items_cmp-filtro-items:filtro:filtro_section_v-input:button_search"]')
                .click();
            await page.waitForLoadState('networkidle');

            // Verificar que el nombre aparece en la tabla
            await expect(
                page.getByRole('table').getByText(textoBusqueda).first(),
            ).toBeAttached({timeout: 15_000});
        });

        // Limpieza del archivo temporal
        cleanupTempFile(tempFilePath);
    });
});
