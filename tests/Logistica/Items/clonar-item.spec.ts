import { test, expect } from '../fixtures/edicion-clonado-fixture';
import { buildUniqueClonedItemName } from '../helpers/nombre-clonado.helper';

test.describe('Clonado de item', () => {

  /**
   * Escenario: clonar un producto existente (código 888888) cambiando el nombre.
   *
   * Flujo:
   * 1. Buscar item origen por código → abrir clonado
   * 2. Reemplazar el nombre con uno único que incluya "CLONADO" + timestamp
   * 3. Confirmar clonado
   * 4. Ir a lista de ítems
   * 5. Verificar que el item clonado aparece en la lista con el nombre generado
   *
   * Regla: el nombre se genera con buildUniqueClonedItemName() y
   * se reutiliza tanto en el llenado como en la validación posterior.
   */
  test('clonar producto existente con nombre único', async ({
    page,
    listaItems,
    edicionItem,
  }) => {
    const codigoItemOrigen = '888888';
    const nombreClonado = buildUniqueClonedItemName('item para clonacion');

    await test.step('Buscar item origen por código y abrir clonado', async () => {
      await listaItems.searchAndClone(codigoItemOrigen);
    });

    await test.step('Reemplazar nombre con nombre único de clonado', async () => {
      await edicionItem.updateName(nombreClonado);
    });

    await test.step('Confirmar clonado', async () => {
      await edicionItem.clickClonarProducto();
    });

    await test.step('Ir a lista de ítems', async () => {
      await edicionItem.clickIrAListaItems();
    });

    await test.step('Verificar item clonado visible en lista', async () => {
      // El nombre puede estar truncado por CSS (elipsis-line) en la columna Nombre.
      // Usamos toBeAttached() para confirmar que el DOM contiene el nombre completo,
      // y verificamos en la tabla que existe una fila con el texto del clonado.
      await expect(page.getByRole('table').getByText(nombreClonado).first()).toBeAttached();
    });
  });
});
