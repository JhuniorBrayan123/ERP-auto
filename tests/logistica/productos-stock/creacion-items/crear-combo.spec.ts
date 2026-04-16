import {expect, test} from '@fixtures/Logistica/items-fixture';
import {buildUniqueItemName} from '@helpers/Logistica/unique-name.helper';
import type {ComponenteCombo} from '@helpers/Logistica/item-data.types';

test.describe('Creación de Combos', {tag: ['@logistica', '@productos-stock']}, () => {

    test('crear combo con items estrictos gravados', async ({
                                                                comboForm,
                                                                itemDetail,
                                                            }) => {
        test.setTimeout(120_000)
        const nombre = buildUniqueItemName('combo', 'items estrictos');

        const componentes: ComponenteCombo[] = [
            {codigoBusqueda: '111111', textoSeleccion: 'Item para combos estricto gravado'},
            {
                codigoBusqueda: '131313',
                textoSeleccion: 'item variante estricto gravado',
                variante: 'Variante 1 estricto'
            },
            {
                codigoBusqueda: '101010',
                textoSeleccion: 'item equivalente estricto gravado',
                equivalencia: 'Equivalente X2'
            },
        ];

        await test.step('Iniciar creación de combo', async () => {
            await comboForm.iniciarCreacionCombo();
        });

        await test.step('Llenar datos básicos', async () => {
            await comboForm.llenarNombre(nombre);
            await comboForm.llenarPrecios('150', '44.5');
        });

        await test.step('Agregar componentes', async () => {
            await comboForm.irATabComponentes();
            for (const comp of componentes) {
                await comboForm.buscarYAgregarComponente(comp);
            }
        });

        await test.step('Configurar información adicional', async () => {
            await comboForm.expandirOpcionesAvanzadas();
            await comboForm.llenarInfoAdicional('AUTO-TEST', 'AUTOMATIZADO');
        });

        await test.step('Crear combo y confirmar', async () => {
            await comboForm.crearCombo();
            await expect(comboForm['page'].getByRole('button', {name: 'Ir a lista de ítems'}))
                .toBeVisible();
            await comboForm.clickIrAListaItems();
        });

        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });


    test('crear combo con items flexibles gravados', async ({
                                                                comboForm,
                                                                itemDetail,
                                                            }) => {
        const nombre = buildUniqueItemName('combo', 'items flexibles');

        const componentes: ComponenteCombo[] = [
            {codigoBusqueda: '121212', textoSeleccion: 'item para combos gravado flexible'},
            {codigoBusqueda: '313131', textoSeleccion: 'item con variante flexible', variante: 'Variante 1 flexible'},
            {codigoBusqueda: '202020', textoSeleccion: 'item equivalente flexible', equivalencia: 'Equivalente X2'},
            {codigoBusqueda: '545454', textoSeleccion: 'item selector flexible'},
        ];

        await test.step('Iniciar creación de combo', async () => {
            await comboForm.iniciarCreacionCombo();
        });

        await test.step('Llenar datos básicos', async () => {
            await comboForm.llenarNombre(nombre);
            await comboForm.llenarPrecios('144.52', '35.9');
        });

        await test.step('Agregar componentes', async () => {
            await comboForm.irATabComponentes();
            for (const comp of componentes) {
                await comboForm.buscarYAgregarComponente(comp);
            }
        });

        await test.step('Configurar información adicional', async () => {
            await comboForm.expandirOpcionesAvanzadas();
            await comboForm.llenarInfoAdicional('AUTO-TEST', 'AUTOMATIZADO');
        });

        await test.step('Crear combo y confirmar', async () => {
            await comboForm.crearCombo();
            await expect(comboForm['page'].getByRole('button', {name: 'Ir a lista de ítems'}))
                .toBeVisible();
            await comboForm.clickIrAListaItems();
        });

        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });

    test('crear combo con items sin control de stock', async ({
                                                                  comboForm,
                                                                  itemDetail,
                                                              }) => {
        const nombre = buildUniqueItemName('combo', 'items sin control');

        const componentes: ComponenteCombo[] = [
            {codigoBusqueda: '151515', textoSeleccion: 'item gravado sin control'},
            {codigoBusqueda: '333333', textoSeleccion: 'item variante sin control', variante: 'Variante 1'},
            {codigoBusqueda: '303030', textoSeleccion: 'item equivalente sin control', equivalencia: 'Equivalente X2'},
        ];

        await test.step('Iniciar creación de combo', async () => {
            await comboForm.iniciarCreacionCombo();
        });

        await test.step('Llenar datos básicos', async () => {
            await comboForm.llenarNombre(nombre);
            await comboForm.llenarPrecios('155.52', '155.50');
        });

        await test.step('Agregar componentes', async () => {
            await comboForm.irATabComponentes();
            for (const comp of componentes) {
                await comboForm.buscarYAgregarComponente(comp);
            }
        });

        await test.step('Configurar info adicional y campos adicionales', async () => {
            await comboForm.expandirOpcionesAvanzadas();
            await comboForm.llenarInfoAdicional('AUTO-TEST', 'AUTOMATIZADO');

            // Campos adicionales para este combo
            await comboForm.irATabCamposAdicionales();
            await comboForm.llenarCampoAdicionalTexto('combo automatizado');
            await comboForm.llenarCampoAdicionalNumerico('12');
        });

        await test.step('Crear combo y confirmar', async () => {
            await comboForm.crearCombo();
            await expect(comboForm['page'].getByRole('button', {name: 'Ir a lista de ítems'}))
                .toBeVisible();
            await comboForm.clickIrAListaItems();
        });

        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });
});
