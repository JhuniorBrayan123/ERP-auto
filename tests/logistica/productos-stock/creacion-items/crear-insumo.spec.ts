import {expect, test} from '@fixtures/Logistica/items-fixture';
import {buildUniqueItemName} from '@helpers/Logistica/unique-name.helper';

test.describe('Creación de Insumos', {tag: ['@logistica', '@productos-stock']}, () => {

    test('crear insumo sin control de stock', async ({insumoForm, itemDetail}) => {
        const nombre = buildUniqueItemName('insumo', 'sin control');

        await test.step('Iniciar creación de insumo', async () => {
            await insumoForm.iniciarCreacionInsumo();
        });

        await test.step('Llenar nombre (sin precios)', async () => {
            await insumoForm.llenarNombre(nombre);
        });

        await test.step('Configurar info adicional y código de barras', async () => {
            await insumoForm.expandirOpcionesAvanzadas();
            await insumoForm.irATabStock();
            // Sin control de stock → no seleccionamos tipo
            await insumoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
            await insumoForm.llenarCodigoBarras(Date.now().toString());
        });

        await test.step('Crear insumo y confirmar', async () => {
            await insumoForm.crearInsumo();
            await expect(insumoForm['page'].getByRole('button', {name: 'Ir a lista de ítems'}))
                .toBeVisible();
            await insumoForm.clickIrAListaItems();
        });
    });


    test('crear insumo con stock estricto', async ({insumoForm, itemDetail}) => {
        const nombre = buildUniqueItemName('insumo', 'estricto kilos');

        await test.step('Iniciar creación de insumo', async () => {
            await insumoForm.iniciarCreacionInsumo();
        });

        await test.step('Llenar nombre y unidad de medida', async () => {
            await insumoForm.llenarNombre(nombre);
            await insumoForm.seleccionarUnidadMedida('KILOGRAMOS');
        });

        await test.step('Configurar stock estricto', async () => {
            await insumoForm.expandirOpcionesAvanzadas();
            await insumoForm.irATabStock();
            await insumoForm.seleccionarControlEstricto();
            await insumoForm.llenarCantidadesStock('100', '100');
        });

        await test.step('Llenar información adicional', async () => {
            await insumoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
        });

        await test.step('Crear insumo y confirmar', async () => {
            await insumoForm.crearInsumo();
            await expect(insumoForm['page'].getByRole('button', {name: 'Ir a lista de ítems'}))
                .toBeVisible();
            await insumoForm.clickIrAListaItems();
        });

        await test.step('Verificar item completo', async () => {
            await itemDetail.verificarItemCompleto({
                //verificarCompras: true,
                verificarBitacora: true,
            });
        });
    });
});
