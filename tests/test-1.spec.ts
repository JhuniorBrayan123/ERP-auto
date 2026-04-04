import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {

  //Creacion de item estricto gravado 
  await page.goto('https://erpperu2-crt-4.smartclic.pe/auth/login');
  await page.getByRole('textbox', { name: 'Coloca aquí tu correo electró' }).click();
  await page.getByRole('textbox', { name: 'Coloca aquí tu correo electró' }).fill('gutierrezmamanijhuniorb+133@gmail.com');
  await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' }).click();
  await page.getByRole('textbox', { name: 'Coloca aquí tu contraseña' }).fill('Smart123.');
  await page.getByRole('button', { name: 'INICIAR SESION' }).click();
  await page.getByText('Productos y servicios').click();
  await page.locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]').click();
  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('PNuevo producto').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('ITEM');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('I');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('Item gravado estricto');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('1001');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('10');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('1');
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('10');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('10');
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.locator('[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto"]').click();
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').first().click();
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').first().fill('1001');
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').nth(1).click();
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').nth(1).fill('100');
  await page.getByText('Información adicional(').click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.locator('div').filter({ hasText: /^REGRESION$/ }).click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div:nth-child(3) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByText('Equivalencias(Opcional)').click();
  await page.getByText('Campos adicionales(Opcional)').click();
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:texto"]').click();
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:texto"]').fill('item Automatizado');
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:fecha"]').click();
  await page.getByRole('button', { name: 'viernes, 24 de abr de' }).click();
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:numerico"]').click();
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:numerico"]').fill('1');
  await page.getByRole('button', { name: 'Crear producto' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:visualizar-item"]').click();
  await page.locator('.v-modal > div').first().click();
  await page.locator('.v-icon-base > .icon').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:ventas"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:compras"]').click();
  await page.getByText('Bitácora').click();
  await page.getByRole('button', { name: 'Atrás' }).click();


  // Creacion de item sin control stock gravado

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('PNuevo producto').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('I');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('Item gravado sin control de stock');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('10');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('10');
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.getByText('Información adicional(').click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(3).click();
  await page.getByText('REGRESION').click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div:nth-child(3) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByText('(Opcional)').nth(2).click();
  
  await page.getByRole('button', { name: 'Crear producto' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  // Creacion de item flexible

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('PNuevo producto').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('item gravado contrl flexible');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('11.25');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('11.25');
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.getByText('Información básicaStock(').click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-4"]').nth(1).click();
  await page.locator('[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-flexible"]').click();
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').first().click();
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').first().fill('101');
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').nth(1).click();
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').nth(1).fill('10');
  await page.getByText('Información adicional(').click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.locator('div').filter({ hasText: /^REGRESION$/ }).click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByRole('button', { name: 'Crear producto' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:visualizar-item"]').click();
  await page.locator('.v-modal > div').first().click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:ventas"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:compras"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  //Creacion de item exonerado estricto

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"] div').filter({ hasText: /^Crear ítems$/ }).click();
  await page.getByText('PNuevo producto').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('item exonerado  estricto');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('12.22');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('15.25');
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.locator('.tabs-content > div').click();
  await page.locator('[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto"]').click();
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').first().click();
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').first().fill('11');
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').nth(1).click();
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').nth(1).fill('11');
  await page.getByText('Información adicional(').click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.getByText('REGRESION').click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div:nth-child(3) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByRole('button', { name: 'Crear producto' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:visualizar-item"]').click();
  await page.locator('.v-modal > div').first().click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:ventas"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:compras"]').click();
  await page.getByText('Bitácora').click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  //Creacion de items con ICBPER
  
  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('PNuevo producto').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('item con ');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('item con ICBPER');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('10');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('10');
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.locator('[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-flexible"]').click();
  await page.getByText('Información adicional(').click();
  await page.locator('.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.getByText('REGRESION').click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div:nth-child(3) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.locator('.impuestos > div:nth-child(2) > .v-switch > .switch-content > .switch > .slider').first().click();
  await page.getByRole('button', { name: 'Crear producto' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:visualizar-item"]').click();
  await page.locator('.v-modal > div').first().click();
  await page.locator('div').filter({ hasText: 'Ver StockVisualiza el stock' }).nth(3).click();
  await page.getByRole('button', { name: 'Atrás' }).click();


  // items con caracteres especiales: 	Bien caracteres especiales !#$%&'()*+,-./:;<=>?@[\]^_{}~

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('PNuevo producto').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('item con  caracteres especiales !#$%&\'()*+,-./:;<=>?@[\\]^_{}~');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('15.2525');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('15.2525');
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.locator('[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-flexible"]').click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-2"]').nth(2).click();
  await page.locator('.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.locator('div').filter({ hasText: /^REGRESION$/ }).click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.locator('div').filter({ hasText: /^AUTO-TEST$/ }).nth(2).click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByRole('button', { name: 'Crear producto' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:ventas"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:compras"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.getByRole('button', { name: 'Atrás' }).click();


  // items con isc con tipo de sistema al valor: 2.5
  

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('PNuevo producto').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('i');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('I');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('Item con ');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('Item con ISC');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('15.000');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('15.2525');
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.locator('[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-flexible"]').click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-2"]').nth(2).click();
  await page.locator('.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.locator('div').filter({ hasText: /^REGRESION$/ }).click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.getByText('AUTOMATIZADO').click();
  await page.locator('div').filter({ hasText: /^Agregar impuesto para BOLSAS PLÁSTICAS \(ICBPER\)Otros cargos \(ISC\)$/ }).first().click();
  await page.locator('.row > div:nth-child(2) > div:nth-child(2) > .v-switch > .switch-content > .switch > .slider').click();
  await page.locator('.v-select-header-form-arrow.invalid').click();
  await page.locator('div').filter({ hasText: /^Sistema al valor$/ }).click();
  await page.getByRole('textbox', { name: 'Monto', exact: true }).click();
  await page.getByRole('textbox', { name: 'Monto', exact: true }).fill('2.5');
  await page.getByRole('button', { name: 'Crear producto' }).click();
  await page.getByRole("button", { name: "Ir a lista de ítems" }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:ventas"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:compras"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  // items con isc con tipo aplicacion al monto fijo 1.5

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('PNuevo producto').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('item con ');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('item con ISC 2');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('11.52');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('3.5');
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.locator('[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-flexible"]').click();
  await page.getByText('Información adicional(').click();
  await page.locator('.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.getByText('REGRESION').click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.getByText('AUTOMATIZADO').click();
  await page.locator('.row > div:nth-child(2) > div:nth-child(2) > .v-switch > .switch-content > .switch > .slider').click();
  await page.locator('div').filter({ hasText: /^Tipo de sistema ISC$/ }).nth(2).click();
  await page.getByText('Aplicación al monto fijo').click();
  await page.getByRole('textbox', { name: 'Monto', exact: true }).click();
  await page.getByRole('textbox', { name: 'Monto', exact: true }).fill('1.5');
  await page.getByRole('button', { name: 'Crear producto' }).click();

  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:visualizar-item"]').click();
  await page.locator('.v-modal > div').first().click();
  await page.locator('.v-icon-base > .icon').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.getByText('Ventas', { exact: true }).click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:compras"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  //Creacion de servicios:

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('SNuevo servicio').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('nuevo servicio gravado');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('15');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('151');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('51');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.locator('.advance > .icon').click();
  await page.getByText('Información adicional(').click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.getByText('REGRESION').click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTO-TEST').click();

  await page.locator('div:nth-child(3) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByRole('button', { name: 'Crear servicio' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  
  await page.locator('.v-icon-base > .icon').first().click();
  await page.locator('.cmp-dropdown-toggle.is-open').click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.getByText('Bitácora').click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  //Creacion de servicio inafecto:

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('SNuevo servicio', { exact: true }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('servicio inafecto data');
  await page.locator('.v-select-header-form-arrow.form.form-control').click();
  await page.locator('div').filter({ hasText: /^Exonerado \(No paga IGV\)$/ }).click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('20');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('20');
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.locator('.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.getByText('REGRESION').click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div:nth-child(3) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByText('Campos adicionales(Opcional)').click();
  await page.getByRole('button', { name: 'Crear servicio' }).click();
   await page.getByRole("button", { name: "Ir a lista de ítems" }).click();
   await page.locator('.v-icon-base > .icon').first().click();
   await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
   await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
   await page.getByRole('button', { name: 'Atrás' }).click();
  
  //Creacion de insumo sin control de stock:

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('INuevo insumo').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('nuevo insumo data');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('nuevo insumo data unidad');
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.getByText('Información adicional(').click();
  await page.locator('.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.getByText('REGRESION').click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div:nth-child(3) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByRole('textbox', { name: 'Escanea o digita el código de' }).click();
  await page.getByRole('textbox', { name: 'Escanea o digita el código de' }).fill('12545245245245245');
  await page.getByRole('button', { name: 'Crear insumo' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();


  //Creacion de insumo con control de stock estricto:

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('INuevo insumo', { exact: true }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('h');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('harina');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('harina insumo kilos');
  await page.locator('.v-select-header-form-arrow').first().click();
  await page.getByText('KILOGRAMOS').click();
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.getByText('Stock(Opcional)').click();
  await page.locator('[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto"]').click();
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').first().click();
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').first().fill('100');
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').nth(1).click();
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').nth(1).fill('100');
  await page.getByText('Información básicaStock(').click();
  await page.locator('.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.getByText('REGRESION').click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div:nth-child(3) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByRole('button', { name: 'Crear insumo' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:visualizar-item"]').click();
  await page.locator('.v-modal > div').first().click();
  await page.locator('div').filter({ hasText: 'Ver StockVisualiza el stock' }).nth(3).click();
  await page.getByText('Ventas', { exact: true }).click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  //creacion de combo con items estrictos gravados

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('CNuevo combo').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('combo gravado items estrictos');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('150');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('44.5');
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('111111');
  await page.getByText('Pproducto111111Item para combos estricto gravado0 un').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('131313');
  await page.getByText('Pvproducto131313item variante estricto gravado(Con Variantes)0 un').click();
  await page.getByText('Variante 1 estricto').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('101010');
  await page.getByText('Peproducto101010item equivalente estricto gravado(Con Equivalencias)0 un').click();
  await page.getByText('Equivalente X2Factor').click();
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(2).click();
  await page.locator('.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByRole('button', { name: 'Crear combo' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.getByText('VentasBitácora').click();
  await page.getByText('Bitácora').click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  //Creacion de combo con items flexibles gravados

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('CNuevo combo').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('Tab');
  await page.locator('div').filter({ hasText: /^UNIDAD$/ }).first().press('CapsLock');
  await page.locator('div').filter({ hasText: /^UNIDAD$/ }).first().press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('C');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('Combo items flexibles auto');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('144.52');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('35.9');
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('121212');
  await page.getByText('Pproducto121212item para combos gravado flexible0 un').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('313131');
  await page.getByText('item con variante flexible').click();
  await page.getByText('Variante 1 flexible').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('202020');
  await page.getByText('item equivalente flexible').click();
  await page.getByText('Equivalente X2').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('545454');
  await page.getByText('item selector flexible').click();
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(2).click();
  await page.locator('.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByRole('button', { name: 'Crear combo' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  //Creacion de items con items sin control 

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('CNuevo combo').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('combo con items sin control de sotck');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('155.5200');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('155.50');
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('333333');
  await page.getByText('item variante sin control').click();
  await page.getByText('Variante 1').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('303030');
  await page.getByText('item equivalente sin control').click();
  await page.getByText('Equivalente X2').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('');
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(2).click();
  await page.locator('.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-3"]').nth(3).click();
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:texto"]').click();
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:texto"]').fill('combo automatizado');
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:fecha"]').click();
  await page.getByRole('button', { name: 'viernes, 10 de abr de' }).click();
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:numerico"]').click();
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:numerico"]').fill('12');
  await page.getByRole('button', { name: 'Crear combo' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.v-icon-base > .icon').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  //Creacion de receta con insumos con control de stock

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('RNueva receta').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('R');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('Receta con insumos estrictos');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('50.2222');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('15.45');
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('464646');
  await page.getByText('Nuevo insumo test1').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('444666');
  await page.getByText('nuevo insumo con').click();
  await page.getByText('equivalenteX2 insumo').click();
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(2).click();
  await page.locator('.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-3"]').nth(3).click();
  await page.getByRole('button', { name: 'Crear receta' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.getByRole('button', { name: 'Atrás' }).click();


  //Creacion de receta con insumos flexibles 

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('RNueva receta').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('R');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('Receta con insumos flexiblwes');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).press('ArrowLeft');
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('Receta con insumos flexibles');
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-8"]').first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('41.515');
  await page.locator('.content.has-options > .options-final > .valor-final > .v-input > .v-input-form > .v-input-form-base > .v-input-form-base-container').click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('10.5');
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-8"]').first().click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('666444');
  await page.getByText('nuevo insumo flexible').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.getByText('Información adicional(').click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(3).click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(3).click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByText('Campos adicionales(Opcional)').click();
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:texto"]').click();
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:texto"]').fill('receta automatizada');
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:fecha"]').click();
  await page.locator('div').filter({ hasText: /^15$/ }).first().click();
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:numerico"]').click();
  await page.locator('[id="lgt_reg-item_v-tab:campos-adicionales_grilla-campos-adicionales:campo-adicional_v-input:numerico"]').fill('14141');
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-5"]').nth(4).click();
  await page.locator('div').filter({ hasText: /^Añadir selector$/ }).first().click();
  await page.getByRole('button', { name: 'Nuevo selector' }).click();
  await page.getByRole('textbox', { name: 'Digita el título del selector' }).click();
  await page.getByRole('textbox', { name: 'Digita el título del selector' }).fill('receta con items manuales');
  await page.locator('[id="lgt_reg-item_cmp-card-selectores:opcion_div:libre"]').click();
  await page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:nombre"]').click();
  await page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:nombre"]').fill('nueva receta auto');
  await page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]').click();
  await page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]').fill('012');
  await page.getByRole('button', { name: 'Añadir opción' }).click();
  await page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:nombre"]').nth(1).click();
  await page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:nombre"]').nth(1).fill('receta auto 2');
  await page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]').nth(1).click();
  await page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]').nth(1).fill('010');

  await page.getByText('Crear selectores con ítems de').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto o' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto o' }).fill('666444');
  await page.getByText('666444nuevo insumo flexible10niu$').click();
  await page.locator('.v-modal > div').first().click();
  await page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]').nth(2).click();
  await page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]').nth(2).fill('015');
  await page.getByRole('button', { name: 'Crear selector' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('.obligatorio > div').click();
  await page.getByRole('button', { name: 'Crear receta' }).click();
  await page.getByRole('button', { name: 'Crear receta' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.getByText("Bitácora").click();
  await page.getByRole("button", { name: "Atrás" }).click();

  //Creacion de recta con insumos sin control de stock

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('RNueva receta').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('receta con insumo sin control de stock');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('14.525');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('15.5245');
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('444444');
  await page.getByText('Nuevo insumo sin control de').click();
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(2).click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div').filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByRole('button', { name: 'Crear receta' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.getByText('Bitácora').click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  //Creacion de receta con productos estrcitos

  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('RNueva receta').click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).click();
  await page.getByRole('textbox', { name: 'Ej. Gaseosa Kola R (500ml)' }).fill('receta con items estrictos');
  await page.getByRole('textbox', { name: 'Monto final' }).first().click();
  await page.getByRole('textbox', { name: 'Monto final' }).first().fill('20.4545');
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).click();
  await page.getByRole('textbox', { name: 'Monto final' }).nth(1).fill('20.45454');
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('111111');
  await page.getByText('Item para combos estricto').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('131313');
  await page.getByText('item variante estricto gravado').click();
  await page.getByText('Variante 3 estricto').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('101010');
  await page.getByText('item equivalente estricto').click();
  await page.getByText('item equivalente estricto gravadoFactor Multiplicador:1S/').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('454545');
  await page.getByText('item selector gravado').click();
  await page.locator('div').filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();
  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(2).click();
  await page.locator('.subcategoria > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').first().click();
  await page.getByText('AUTO-TEST').click();
  await page.locator('div:nth-child(2) > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('AUTOMATIZADO').click();
  await page.getByRole('textbox', { name: 'Escanea o digita el código de' }).click();
  await page.getByRole('textbox', { name: 'Escanea o digita el código de' }).fill('444444444444444444444444444444444');
  await page.getByRole('textbox', { name: 'Ingresa código alternativo' }).click();
  await page.getByRole('textbox', { name: 'Ingresa código alternativo' }).fill('cuatros');
  await page.getByRole('textbox', { name: 'Descripción del ítem' }).click();
  await page.getByRole('textbox', { name: 'Descripción del ítem' }).fill('receta con items estrictos');
  await page.getByRole('button', { name: 'Crear receta' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  //Creacion de listas con items con control de stock estrictos


  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('LNueva lista').click();
  await page.getByRole('textbox', { name: 'Ej. Lista de útiles primaria' }).click();
  await page.getByRole('textbox', { name: 'Ej. Lista de útiles primaria' }).fill('lista con item estricto');
  await page.getByRole('textbox', { name: 'Descripción del ítem' }).click();
  await page.getByRole('textbox', { name: 'Descripción del ítem' }).fill('nueva lista auto');
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('111111');
  await page.getByText('Item para combos estricto').click();
  await page.locator('[id="lgt_reg-item_cmp-lista-productos_cmp-box_cmp-producto-agregado_v-step:cantidad_div:increase"]').click();
  await page.locator('[id="lgt_reg-item_cmp-lista-productos_cmp-box_cmp-producto-agregado_v-step:cantidad_div:increase"]').click();
  await page.locator('[id="lgt_reg-item_cmp-lista-productos_cmp-box_cmp-producto-agregado_v-step:cantidad_div:increase"]').click();
  await page.locator('[id="lgt_reg-item_cmp-lista-productos_cmp-box_cmp-producto-agregado_v-step:cantidad_div:increase"]').click();
  await page.getByRole('button', { name: 'Crear lista' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();

  await page.getByText('VentasBitácora').click();
  await page.locator('div').filter({ hasText: /^Ver listado$/ }).click();
  await page.locator('.v-modal > div').first().click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  //Creacion de listas con items sin control de stock
  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('LNueva lista').click();
  await page.getByRole('textbox', { name: 'Ej. Lista de útiles primaria' }).click();
  await page.getByRole('textbox', { name: 'Ej. Lista de útiles primaria' }).fill('lista con item sin control');
  await page.getByRole('textbox', { name: 'Descripción del ítem' }).click();
  await page.getByRole('textbox', { name: 'Descripción del ítem' }).fill('nueva lista auto');
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  
  await page.getByRole('button', { name: 'Crear lista' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.getByText('Ver listado').click();
  await page.locator('.v-modal > div').first().click();
  await page.getByRole('button', { name: 'Atrás' }).click();

  //Creacion de listas cin items flexibles0

  
  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText('LNueva lista').click();
  await page.getByRole('textbox', { name: 'Ej. Lista de útiles primaria' }).click();
  await page.getByRole('textbox', { name: 'Ej. Lista de útiles primaria' }).fill('lista con items flexible');
  await page.getByRole('textbox', { name: 'Ej. Lista de útiles primaria' }).press('Enter');
  await page.getByRole('textbox', { name: 'Descripción del ítem' }).click();
  await page.getByRole('textbox', { name: 'Descripción del ítem' }).fill('nueva lista auto');
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('121212');
  await page.getByText('item para combos gravado').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('313131');
  await page.getByText('item con variante flexible').click();
  await page.getByText('Variante 1 flexible').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('202020');
  await page.getByText('item equivalente flexible').click();
  await page.getByText('Equivalente X2').click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).click();
  await page.getByRole('textbox', { name: 'Buscar nombre del producto, c' }).fill('545454');
  await page.getByText('item selector flexible').click();
  await page.getByRole('button', { name: 'Crear lista' }).click();
  await page.getByRole('button', { name: 'Ir a lista de ítems' }).click();
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]').click();
  await page.locator('div').filter({ hasText: /^Ver listado$/ }).click();
  await page.locator('.v-modal > div').first().click();
  await page.getByRole('button', { name: 'Atrás' }).click();
  


});

