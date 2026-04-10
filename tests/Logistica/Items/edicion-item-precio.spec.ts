import { test, expect } from '../../../src/fixtures/Logistica/edicion-clonado-fixture';
import { generateRandomPrice } from '../../../src/helpers/Logistica/random-price.helper';

test.describe('Edición de precio de item',{ tag: ['@logistica'] }, () => {

  /**
   * Escenario: editar los precios en soles y dólares de un producto existente (código 889988).
   *
   * Flujo:
   * 1. Buscar item por código → abrir edición
   * 2. Cambiar precio estándar (soles) y precio dólares con valores aleatorios
   * 3. Confirmar actualización
   * 4. Verificar bitácora del cambio
   */
  test('editar precios de producto existente', async ({
    page,
    listaItems,
    edicionItem,
    itemDetail,
  }) => {
    const codigoItem = '889988';
    const nuevoPrecioSoles = generateRandomPrice();
    const nuevoPrecioDolares = generateRandomPrice();

    await test.step('Buscar item por código y abrir edición', async () => {
      await listaItems.searchAndEdit(codigoItem);
    });

    await test.step(`Actualizar precios: S/ ${nuevoPrecioSoles} | $ ${nuevoPrecioDolares}`, async () => {
      await edicionItem.updatePrices(nuevoPrecioSoles, nuevoPrecioDolares);
    });

    await test.step('Confirmar actualización', async () => {
      await edicionItem.clickActualizarProducto();
      await edicionItem.closeSuccessModal();
    });

    await test.step('Buscar item editado por código en la lista', async () => {
      await listaItems.searchByCode(codigoItem);
    });

    await test.step('Abrir Ver Ítem desde la lista', async () => {
      await itemDetail.abrirMenuAccionesItem();
      await itemDetail.clickVerItem();
    });

    await test.step('Verificar bitácora del cambio de precios', async () => {
      await itemDetail.irATabBitacora();
    });

    await test.step('Regresar a lista', async () => {
      await itemDetail.clickAtras();
    });
  });
});
