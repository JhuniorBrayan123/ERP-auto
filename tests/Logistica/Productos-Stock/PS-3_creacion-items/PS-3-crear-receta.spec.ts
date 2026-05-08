import {test} from '@fixtures/Logistica/items-fixture';
import {buildUniqueItemName} from '@helpers/Logistica/unique-name.helper';
import type {InsumoReceta} from '@helpers/Logistica/item-data.types';
import {confirmarCreacionEIrALista, prepararRecetaBase,} from '@helpers/Logistica/verificaciones-items.helper';

test.describe('PS-3 | Creación de Recetas', {tag: ['@logistica', '@productos-stock']}, () => {

    test('crear receta con insumos estrictos @PS-3', async ({
                                                                recetaForm,
                                                                itemDetail,
                                                            }) => {
        const nombre = buildUniqueItemName('receta', 'insumos estrictos');

        const insumos: InsumoReceta[] = [
            {codigoBusqueda: '464646', textoSeleccion: 'Nuevo insumo test1'},
            {codigoBusqueda: '444666', textoSeleccion: 'nuevo insumo con', equivalencia: 'equivalenteX2 insumo'},
        ];
        await prepararRecetaBase(recetaForm, nombre, {venta: '50.22', compra: '15.45'}, insumos);
        await confirmarCreacionEIrALista(recetaForm, () => recetaForm.crearReceta());
        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });


    test('crear receta con insumos sin control @PS-3', async ({
                                                                  recetaForm,
                                                                  itemDetail,
                                                              }) => {
        const nombre = buildUniqueItemName('receta', 'insumos sin control');

        const insumos: InsumoReceta[] = [
            {codigoBusqueda: '444444', textoSeleccion: 'Nuevo insumo sin control de'},
        ];

        await prepararRecetaBase(recetaForm, nombre, {venta: '14.525', compra: '15.52'}, insumos);
        await confirmarCreacionEIrALista(recetaForm, () => recetaForm.crearReceta());

        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });


    test('crear receta con productos estrictos @PS-3', async ({
                                                                  recetaForm,
                                                                  itemDetail,
                                                              }) => {
        const nombre = buildUniqueItemName('receta', 'productos estrictos');

        const componentes: InsumoReceta[] = [
            {codigoBusqueda: '111111', textoSeleccion: 'Item para combos estricto'},
            {
                codigoBusqueda: '131313',
                textoSeleccion: 'item variante estricto gravado',
                variante: 'Variante 3 estricto'
            },
            {
                codigoBusqueda: '101010',
                textoSeleccion: 'item equivalente estricto',
                equivalencia: 'item equivalente estricto gravado'
            },
            {codigoBusqueda: '454545', textoSeleccion: 'item selector gravado'},
        ];

        await prepararRecetaBase(recetaForm, nombre, {venta: '20.45', compra: '20.45'}, componentes);

        await test.step('Configurar identificación adicional', async () => {
            const codigoUnico = Date.now().toString();
            await recetaForm.llenarCodigoBarras(codigoUnico);
            await recetaForm.llenarCodigoAlternativo(`alt-${codigoUnico.slice(-8)}`);
            await recetaForm.llenarDescripcion('receta con items estrictos');
        });

        await confirmarCreacionEIrALista(recetaForm, () => recetaForm.crearReceta());

        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });


    // test('crear receta con insumos estrictos para facturacion @PS-3', async ({
    //                                                                              recetaForm,
    //                                                                              itemDetail,
    //                                                                          }) => {
    //     const nombre = buildUniqueItemName('receta', 'insumos estrictos');
    //
    //     const insumos: InsumoReceta[] = [
    //         {codigoBusqueda: '464646', textoSeleccion: 'Nuevo insumo test1'},
    //         {codigoBusqueda: '444666', textoSeleccion: 'nuevo insumo con', equivalencia: 'equivalenteX2 insumo'},
    //     ];
    //     await prepararRecetaBase(recetaForm, nombre, {venta: '50.22', compra: '15.45'}, insumos);
    //     await confirmarCreacionEIrALista(recetaForm, () => recetaForm.crearReceta());
    //     await test.step('Verificar bitácora', async () => {
    //         await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
    //     });
    // });
});
