import {expect, test} from '@fixtures/Logistica/items-fixture';
import {buildUniqueItemName} from '@helpers/Logistica/unique-name.helper';
import {confirmarCreacionEIrALista} from '@helpers/Logistica/verificaciones-items.helper';

test.describe('PS-3 | Creación de Insumos', {tag: ['@logistica', '@productos-stock']}, () => {

    test('crear insumo sin control de stock @PS-3', async ({insumoForm, itemDetail}) => {
        const nombre = buildUniqueItemName('insumo', 'sin control');

        await test.step('Iniciar creación de insumo', async () => {
            await insumoForm.iniciarCreacionInsumo();
        });
        await test.step('Llenar nombre (sin precios)', async () => {
            await insumoForm.llenarNombre(nombre);
        });
        await test.step('Configurar info adicional y código de barras', async () => {
            await insumoForm.expandirOpcionesAvanzadas();
            await expect(
                insumoForm.page.getByText('Información adicional')
            ).toBeVisible({timeout: 5000});
            await insumoForm.llenarInfoAdicional('REGRESION', 'AUTO-TEST', 'AUTOMATIZADO');
            // await insumoForm.irATabStock();
            await insumoForm.llenarCodigoBarras(Date.now().toString());
        });
        await confirmarCreacionEIrALista(insumoForm, () => insumoForm.crearInsumo());
    });


    test('crear insumo con stock estricto @PS-3', async ({insumoForm, itemDetail}) => {
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
        await confirmarCreacionEIrALista(insumoForm, () => insumoForm.crearInsumo());
        await test.step('Verificar item completo', async () => {
            await itemDetail.verificarItemCompleto({
                //verificarCompras: true,
                verificarBitacora: true,
            });
        });
    });
});
