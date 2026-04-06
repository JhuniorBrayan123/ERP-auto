import { test, expect } from '../../../src/fixtures/Logistica/items-fixture';
import { buildUniqueItemName } from '../../../src/helpers/Logistica/unique-name.helper';
import type { ProductoListaItem } from '../../../src/helpers/Logistica/item-data.types';

test.describe('Creación de Listas', () => {

  test('crear lista con items estrictos', async ({ listaForm, itemDetail }) => {
    const nombre = buildUniqueItemName('lista', 'items estrictos');

    const productos: ProductoListaItem[] = [
      {
        codigoBusqueda: '111111',
        textoSeleccion: 'Item para combos estricto',
        cantidadIncrementos: 4,
      },
    ];

    await test.step('Iniciar creación de lista', async () => {
      await listaForm.iniciarCreacionLista();
    });

    await test.step('Llenar datos básicos', async () => {
      await listaForm.llenarNombre(nombre);
      await listaForm.llenarDescripcion('nueva lista auto');
    });

    await test.step('Agregar productos a la lista', async () => {
      for (const prod of productos) {
        await listaForm.buscarYAgregarProducto(prod);
      }
    });

    await test.step('Crear lista y confirmar', async () => {
      await listaForm.crearLista();
      await expect(listaForm['page'].getByRole('button', { name: 'Ir a lista de ítems' }))
        .toBeVisible();
      await listaForm.clickIrAListaItems();
    });

    await test.step('Verificar item en detalle', async () => {
      await itemDetail.verificarItemDesdeMenu({
        verificarVentas: true,
        verificarBitacora: true,
      });
    });
  });

  test('crear lista con items sin control', async ({ listaForm, itemDetail }) => {
    const nombre = buildUniqueItemName('lista', 'items sin control');

    const productos: ProductoListaItem[] = [
      {
        codigoBusqueda: '151515',
        textoSeleccion: 'item gravado sin control',
      },
    ];

    await test.step('Iniciar creación de lista', async () => {
      await listaForm.iniciarCreacionLista();
    });

    await test.step('Llenar datos básicos', async () => {
      await listaForm.llenarNombre(nombre);
      await listaForm.llenarDescripcion('nueva lista auto');
    });

    await test.step('Agregar productos a la lista', async () => {
      for (const prod of productos) {
        await listaForm.buscarYAgregarProducto(prod);
      }
    });

    await test.step('Crear lista y confirmar', async () => {
      await listaForm.crearLista();
      await expect(listaForm['page'].getByRole('button', { name: 'Ir a lista de ítems' }))
        .toBeVisible();
      await listaForm.clickIrAListaItems();
    });

    await test.step('Verificar bitácora y listado', async () => {
      await itemDetail.verificarItemDesdeMenu({ verificarBitacora: true });
    });
  });


  test('crear lista con items flexibles', async ({ listaForm, itemDetail }) => {
    const nombre = buildUniqueItemName('lista', 'items flexibles');

    const productos: ProductoListaItem[] = [
      { codigoBusqueda: '121212', textoSeleccion: 'item para combos gravado' },
      { codigoBusqueda: '313131', textoSeleccion: 'item con variante flexible', variante: 'Variante 1 flexible' },
      { codigoBusqueda: '202020', textoSeleccion: 'item equivalente flexible', equivalencia: 'Equivalente X2' },
      { codigoBusqueda: '545454', textoSeleccion: 'item selector flexible' },
    ];

    await test.step('Iniciar creación de lista', async () => {
      await listaForm.iniciarCreacionLista();
    });

    await test.step('Llenar datos básicos', async () => {
      await listaForm.llenarNombre(nombre);
      await listaForm.llenarDescripcion('nueva lista auto');
    });

    await test.step('Agregar productos a la lista', async () => {
      for (const prod of productos) {
        await listaForm.buscarYAgregarProducto(prod);
      }
    });

    await test.step('Crear lista y confirmar', async () => {
      await listaForm.crearLista();
      await expect(listaForm['page'].getByRole('button', { name: 'Ir a lista de ítems' }))
        .toBeVisible();
      await listaForm.clickIrAListaItems();
    });

    await test.step('Verificar bitácora', async () => {
      await itemDetail.verificarItemDesdeMenu({ verificarBitacora: true });
    });
  });
});
