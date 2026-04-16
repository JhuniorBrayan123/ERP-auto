import {expect, test} from '@fixtures/Logistica/items-fixture';
import {buildUniqueItemName} from '@helpers/Logistica/unique-name.helper';
import type {InsumoReceta} from '@helpers/Logistica/item-data.types';

test.describe('Creación de Recetas', {tag: ['@logistica', '@productos-stock']}, () => {

    test('crear receta con insumos estrictos', async ({
                                                          recetaForm,
                                                          itemDetail,
                                                      }) => {
        const nombre = buildUniqueItemName('receta', 'insumos estrictos');

        const insumos: InsumoReceta[] = [
            {codigoBusqueda: '464646', textoSeleccion: 'Nuevo insumo test1'},
            {codigoBusqueda: '444666', textoSeleccion: 'nuevo insumo con', equivalencia: 'equivalenteX2 insumo'},
        ];

        await test.step('Iniciar creación de receta', async () => {
            await recetaForm.iniciarCreacionReceta();
        });

        await test.step('Llenar datos básicos', async () => {
            await recetaForm.llenarNombre(nombre);
            await recetaForm.llenarPrecios('50.22', '15.45');
        });

        await test.step('Agregar insumos', async () => {
            await recetaForm.irATabInsumos();
            for (const insumo of insumos) {
                await recetaForm.buscarYAgregarInsumo(insumo);
            }
        });

        await test.step('Configurar información adicional', async () => {
            await recetaForm.expandirOpcionesAvanzadas();
            await recetaForm.llenarInfoAdicional('AUTO-TEST', 'AUTOMATIZADO');
        });

        await test.step('Crear receta y confirmar', async () => {
            await recetaForm.crearReceta();
            await expect(recetaForm['page'].getByRole('button', {name: 'Ir a lista de ítems'}))
                .toBeVisible();
            await recetaForm.clickIrAListaItems();
        });

        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });


    test('crear receta con insumos sin control', async ({
                                                            recetaForm,
                                                            itemDetail,
                                                        }) => {
        const nombre = buildUniqueItemName('receta', 'insumos sin control');

        const insumos: InsumoReceta[] = [
            {codigoBusqueda: '444444', textoSeleccion: 'Nuevo insumo sin control de'},
        ];

        await test.step('Iniciar creación de receta', async () => {
            await recetaForm.iniciarCreacionReceta();
        });

        await test.step('Llenar datos básicos', async () => {
            await recetaForm.llenarNombre(nombre);
            await recetaForm.llenarPrecios('14.525', '15.52');
        });

        await test.step('Agregar insumos', async () => {
            await recetaForm.irATabInsumos();
            for (const insumo of insumos) {
                await recetaForm.buscarYAgregarInsumo(insumo);
            }
        });

        await test.step('Configurar información adicional', async () => {
            await recetaForm.expandirOpcionesAvanzadas();
            await recetaForm.llenarInfoAdicional('AUTO-TEST', 'AUTOMATIZADO');
        });

        await test.step('Crear receta y confirmar', async () => {
            await recetaForm.crearReceta();
            await expect(recetaForm['page'].getByRole('button', {name: 'Ir a lista de ítems'}))
                .toBeVisible();
            await recetaForm.clickIrAListaItems();
        });

        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });


    test('crear receta con productos estrictos', async ({
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

        await test.step('Iniciar creación de receta', async () => {
            await recetaForm.iniciarCreacionReceta();
        });

        await test.step('Llenar datos básicos', async () => {
            await recetaForm.llenarNombre(nombre);
            await recetaForm.llenarPrecios('20.45', '20.45');
        });

        await test.step('Agregar componentes', async () => {
            await recetaForm.irATabInsumos();
            for (const comp of componentes) {
                await recetaForm.buscarYAgregarInsumo(comp);
            }
        });

        await test.step('Configurar info adicional e identificación', async () => {
            await recetaForm.expandirOpcionesAvanzadas();
            await recetaForm.llenarInfoAdicional('AUTO-TEST', 'AUTOMATIZADO');
            const codigoUnico = Date.now().toString();
            await recetaForm.llenarCodigoBarras(codigoUnico);
            await recetaForm.llenarCodigoAlternativo(`alt-${codigoUnico.slice(-8)}`);
            await recetaForm.llenarDescripcion('receta con items estrictos');
        });

        await test.step('Crear receta y confirmar', async () => {
            await recetaForm.crearReceta();
            await expect(recetaForm['page'].getByRole('button', {name: 'Ir a lista de ítems'}))
                .toBeVisible();
            await recetaForm.clickIrAListaItems();
        });

        await test.step('Verificar bitácora', async () => {
            await itemDetail.verificarItemDesdeMenu({verificarBitacora: true});
        });
    });
});
