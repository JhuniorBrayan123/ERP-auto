import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Edicion de nombre de un item
  await page
    .getByRole("textbox", { name: "Buscar por nombre, código o c" })
    .click();
  await page
    .getByRole("textbox", { name: "Buscar por nombre, código o c" })
    .fill("999999");
  await page
    .locator(
      ".flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle",
    )
    .click();
  await page
    .locator(
      '[id="lgt_items_cmp-grid-options:opciones_items_cmp-dropdown:options-li:edicion-item"]',
    )
    .click();
  await page
    .getByRole("textbox", { name: "Ej. Gaseosa Kola R (500ml)" })
    .click();
  await page
    .getByRole("textbox", { name: "Ej. Gaseosa Kola R (500ml)" })
    .fill("item para editar nombre editado");
  await page.getByRole("button", { name: "Actualizar producto" }).click();
  await page.locator(".v-modal > div").first().click();
  await page
    .locator(
      "tr:nth-child(3) > td:nth-child(16) > .flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle",
    )
    .click();
  await page
    .locator(
      '[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]',
    )
    .click();
  await page.getByText("Bitácora").click();
  await page.getByRole("button", { name: "Atrás" }).click();

  // Edicion de tipo de afectacion de un item

  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('888999');
  await page.locator('.v-icon-base > .icon').first().click();
  await page.locator('[id="lgt_items_cmp-grid-options:opciones_items_cmp-dropdown:options-li:edicion-item"]').click();
  await page.locator('div').filter({ hasText: /^Gravado \(Paga IGV 18%\)$/ }).nth(2).click();
  await page.locator('div').filter({ hasText: /^Gravado - Retiro por premio \(Paga IGV 18%\)$/ }).click();
  await page.getByRole('button', { name: 'Actualizar producto' }).click();
  await page.locator('.v-modal > div').first().click();
  await page.locator('tr:nth-child(2) > td:nth-child(16) > .flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:ventas"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:compras"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.getByRole('button', { name: 'Atrás' }).click();
  // Edicion de precio de un item

  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('889988');
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').click();
  await page.locator('[id="lgt_items_cmp-grid-options:opciones_items_cmp-dropdown:options-li:edicion-item"]').click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('20.55');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('5.3');
  await page.getByRole('button', { name: 'Actualizar producto' }).click();
  await page.locator('.v-modal > div').first().click();
  await page.locator('body').press('CapsLock');
  await page.locator('body').press('CapsLock');
  await page.locator('tr:nth-child(3) > td:nth-child(16) > .flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.getByRole('button', { name: 'Atrás' }).click();
  // Clonar un item

  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('888888');
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').click();
  await page.locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:clonar-item"]').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('item  para clonacion - CLONADO');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('button', { name: 'Clonar producto' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  
  //Exportar items

  await page.locator('.icon-container > .icon').first().click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[id="lgt_cmp-items_cmp-datos-items.li:export"]').click();
  const download = await downloadPromise;







  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
});