/**
 * Referencia histórica Playwright Codegen (actualización masiva).
 * Los flujos reales están en tests/Logistica/ActualizacionMasiva/.
 * Esta carpeta suele ignorarse en CI según testIgnore del proyecto.
 */
import { test } from '@playwright/test';

test('test', async ({ page }) => {
  //caso de actualizacion de datos masivos

  await page.getByText('Productos y servicios').click();
  await page.locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]').click();
  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:options"]').click();
  await page.locator('[id="lgt_cmp-items_cmp-datos-items.li:actualizar-masiva"]').click();
  await page.locator('.popup-container > .button-close').click();
  await page.locator('.popup-container > .button-close > .icon').click();
  await page.getByText('Actualizar datos de ítemsActualiza los datos de tus ítems según tus').click();
  await page.locator('div').filter({ hasText: /^Siguiente$/ }).nth(5).click();
  await page.getByText('ProductosSeleccionar¿Qué es un producto?').click();
  await page.locator('div').filter({ hasText: /^Siguiente$/ }).nth(4).click();
  await page.getByRole('button', { name: 'Seleccionar archivo' }).click();
  await page.getByRole('button', { name: 'Seleccionar archivo' }).setInputFiles('FORMATO_EDICION_PRODUCTOS_Masivos.xlsx');
  await page.getByText('Siguiente').click();
  await page.getByText('Procesar').click();
  await page.getByRole('button', { name: 'Ir al inicio' }).click();

  // el mismo procedimiento para servicio y insumos
  //cards de servicio
  await page.getByText('ServiciosSeleccionar¿Qué es').click();
  //cards de insumos
  await page.getByText('InsumosSeleccionar¿Qué es un').click();


  //segundo caso de actualizacion de stock de items

  await page.locator('.icon-container > .icon').first().click();
  await page.locator('[id="lgt_cmp-items_cmp-datos-items.li:actualizar-masiva"]').click();
  await page.getByText('Actualizar stock de ítemsActualiza los stock de tus ítems según tus').click();
  await page.getByText('Siguiente').click();
  await page.getByRole('button', { name: 'Seleccionar archivo' }).click();
  await page.getByRole('button', { name: 'Seleccionar archivo' }).setInputFiles('FORMATO_ACTUALIZACION_STOCK.xlsx');
  await page.getByText('Siguiente').click();
  await page.getByText('Siguiente').click();
  await page.locator('[id="lgt_items_actualizacion-masivo_cmp-asignacion-almacenes:almacen_v-checkbox:elegir-almacen-0"]').click(); //aqui solo permite uno de los almacenes pero hice click en uno luego en otro la idea sera variar en en cada tes en uno de ellos en uno que se selccinoe jhunior y en otro ventas
  await page.locator('[id="lgt_items_actualizacion-masivo_cmp-asignacion-almacenes:almacen_v-checkbox:elegir-almacen-1"]').click();
  await page.getByText('Procesar').click();
  await page.getByRole('button', { name: 'Ir al inicio' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:visualizar-item"]').click();
  await page.locator('.v-modal > div').first().click();
});
