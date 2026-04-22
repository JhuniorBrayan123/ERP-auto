import {test} from '@fixtures/Logistica/items-fixture';
import {buildUniqueItemName} from '@helpers/Logistica/unique-name.helper';
import type {ProductoListaItem} from '@helpers/Logistica/item-data.types';
import {confirmarCreacionEIrALista, prepararListaBase,} from '@helpers/Logistica/verificaciones-items.helper';

test.describe('PS-3 | Creación de Listas', {tag: ['@logistica', '@productos-stock']}, () => {

    test('crear lista con items estrictos @PS-3', async ({listaForm, itemDetail}) => {
        const nombre = buildUniqueItemName('lista', 'items estrictos');

        const productos: ProductoListaItem[] = [
            {
                codigoBusqueda: '111111',
                textoSeleccion: 'Item para combos estricto',
                cantidadIncrementos: 4,
            },
        ];
        await prepararListaBase(listaForm, nombre, 'nueva lista auto', productos);
        await confirmarCreacionEIrALista(listaForm, () => listaForm.crearLista());
        await test.step('Verificar item en detalle', async () => {
            await itemDetail.verificarItemDesdeMenu({
                //verificarVentas: true,
                verificarBitacora: true,
            });
        });
    });

    test('crear lista con items sin control @PS-3', async ({listaForm, itemDetail}) => {
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


    test('crear lista con items flexibles @PS-3', async ({listaForm, itemDetail}) => {
        const nombre = buildUniqueItemName('lista', 'items flexibles');
        const productos: ProductoListaItem[] = [
            {codigoBusqueda: '121212', textoSeleccion: 'item para combos gravado'},
            {codigoBusqueda: '313131', textoSeleccion: 'item con variante flexible', variante: 'Variante 1 flexible'},
            {codigoBusqueda: '202020', textoSeleccion: 'item equivalente flexible', equivalencia: 'Equivalente X2'},
            {codigoBusqueda: '545454', textoSeleccion: 'item selector flexible'},
        ];

        await prepararListaBase(listaForm, nombre, 'nueva lista auto', productos);
        await confirmarCreacionEIrALista(listaForm, () => listaForm.crearLista());
        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });
});
