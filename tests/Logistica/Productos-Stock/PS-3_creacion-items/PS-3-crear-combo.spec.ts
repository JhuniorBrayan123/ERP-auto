import {test} from '@fixtures/Logistica/items-fixture';
import {ITEMS_TEST} from '@helpers/Logistica/movimiento-data.helper';
import {buildUniqueItemName} from '@helpers/Logistica/unique-name.helper';
import type {ComponenteCombo} from '@helpers/Logistica/item-data.types';
import {confirmarCreacionEIrALista, prepararComboBase,} from '@helpers/Logistica/verificaciones-items.helper';

test.describe('PS-03 | Creación de Combos', {tag: ['@logistica', '@productos-stock']}, () => {

    test('SC-01: crear combo con items estrictos gravados @PS-03.1', async ({
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

        await prepararComboBase(comboForm, nombre, {venta: '150', compra: '44.5'}, componentes);
        await confirmarCreacionEIrALista(comboForm, () => comboForm.crearCombo());
        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });

    test('SC-02: crear combo con items flexibles gravados @PS-03.2', async ({
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

        await prepararComboBase(comboForm, nombre, {venta: '144.52', compra: '35.9'}, componentes);
        await confirmarCreacionEIrALista(comboForm, () => comboForm.crearCombo());

        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });

    test('SC-03: crear combo con items sin control de stock @PS-03.3', async ({
                                                                        comboForm,
                                                                        itemDetail,
                                                                    }) => {
        const nombre = buildUniqueItemName('combo', 'items sin control');

        const componentes: ComponenteCombo[] = [
            {codigoBusqueda: '151515', textoSeleccion: 'item gravado sin control'},
            {codigoBusqueda: ITEMS_TEST.VARIANTE_SIN_CONTROL.codigo, textoSeleccion: ITEMS_TEST.VARIANTE_SIN_CONTROL.nombre, variante: 'Variante sin control 1'},
            {codigoBusqueda: ITEMS_TEST.EQUIVALENTE_SIN_CONTROL.codigo, textoSeleccion: ITEMS_TEST.EQUIVALENTE_SIN_CONTROL.nombre, equivalencia: 'Equivalente X2'},
        ];
        await prepararComboBase(comboForm, nombre, {venta: '155.52', compra: '155.50'}, componentes);

        await test.step('Configurar campos adicionales', async () => {
            await comboForm.irATabCamposAdicionales();
            await comboForm.llenarCampoAdicionalTexto('combo automatizado');
            await comboForm.llenarCampoAdicionalNumerico('12');
        });
        await confirmarCreacionEIrALista(comboForm, () => comboForm.crearCombo());

        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });
    test('SC-04: crear combo con un item sin stock gravados @PS-03.4', async ({
                                                                        comboForm,
                                                                        itemDetail,
                                                                    }) => {
        const nombre = buildUniqueItemName('combo', 'items con uno sin stock');

        const componentes: ComponenteCombo[] = [
            {codigoBusqueda: '121212', textoSeleccion: 'item para combos gravado flexible'},
            {codigoBusqueda: '313131', textoSeleccion: 'item con variante flexible', variante: 'Variante 1 flexible'},
            {codigoBusqueda: '202020', textoSeleccion: 'item equivalente flexible', equivalencia: 'Equivalente X2'},
            {codigoBusqueda: '545454', textoSeleccion: 'item selector flexible'},
            {codigoBusqueda: '111222', textoSeleccion: 'Item sin stock estricto'}
        ];

        await prepararComboBase(comboForm, nombre, {venta: '144.52', compra: '35.9'}, componentes);
        await confirmarCreacionEIrALista(comboForm, () => comboForm.crearCombo());

        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });
});
