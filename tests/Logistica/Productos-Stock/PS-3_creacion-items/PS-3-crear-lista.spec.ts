import {test} from '@fixtures/Logistica/items-fixture';
import {buildUniqueItemName} from '@helpers/Logistica/unique-name.helper';
import type {ProductoListaItem} from '@helpers/Logistica/item-data.types';
import {confirmarCreacionEIrALista, prepararListaBase,} from '@helpers/Logistica/verificaciones-items.helper';

test.describe('PS-03 | Creación de Listas', {tag: ['@logistica', '@productos-stock']}, () => {

    test('SC-01: crear lista con items estrictos @PS-03.1', async ({listaForm, itemDetail}) => {
        const nombre = buildUniqueItemName('lista', 'items estrictos');

        const productos: ProductoListaItem[] = [
            {
                codigoBusqueda: 'PRODUCTO_SIMPLE', 
                textoSeleccion: 'Item para combos estricto', 
                cantidadIncrementos: 4,
            },
        ];
        await prepararListaBase(listaForm, nombre, 'nueva lista auto', productos);
        await confirmarCreacionEIrALista(listaForm, () => listaForm.crearLista());
        await test.step('Verificar item en detalle', async () => {
            await itemDetail.verificarItemDesdeMenu({
                
                verificarBitacora: true,
            });
        });
    });

    test('SC-02: crear lista con items sin control @PS-03.2', async ({listaForm, itemDetail}) => {
        const nombre = buildUniqueItemName('lista', 'items sin control');
        const productos: ProductoListaItem[] = [
            {
                codigoBusqueda: '151515',
                textoSeleccion: 'item gravado sin control',
            },
        ];
        await prepararListaBase(listaForm, nombre, 'nueva lista auto', productos);
        await confirmarCreacionEIrALista(listaForm, () => listaForm.crearLista());

        await test.step('Verificar bitácora y listado', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });

    test('SC-03: crear lista con items flexibles @PS-03.3', async ({listaForm, itemDetail}) => {
        const nombre = buildUniqueItemName('lista', 'items flexibles');
        const productos: ProductoListaItem[] = [
            {codigoBusqueda: 'PRODUCTO_GRAVADO', textoSeleccion: 'item para combos gravado'},
            {
                codigoBusqueda: 'ITEM_VARIANTE_FLEXIBLE',
                textoSeleccion: 'item con variante flexible',
                variante: 'Variante 1 flexible'
            },
            {
                codigoBusqueda: 'ITEM_EQUIVALENTE',
                textoSeleccion: 'item equivalente flexible',
                equivalencia: 'Equivalente X2'
            },
            {codigoBusqueda: 'ITEM_SELECTOR_FLEXIBLE', textoSeleccion: 'item selector flexible'},
        ];

        await prepararListaBase(listaForm, nombre, 'nueva lista auto', productos);
        await confirmarCreacionEIrALista(listaForm, () => listaForm.crearLista());
        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });

});
