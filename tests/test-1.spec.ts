import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  //Primer escenario:
  // # ===================== INGRESO =====================
  // Scenario: Registrar ingreso de almacén correctamente con producto y reflejar aumento de stock
  //   Given que el usuario se encuentra en la pantalla "Nuevo ingreso de almacén"
  //   And selecciona un almacén válido
  //   And selecciona un motivo de ingreso válido
  //   When busca un producto por nombre, código o código de barras
  //   And selecciona el producto en el listado
  //   And el sistema agrega el producto a la grilla
  //   And define una cantidad válida mayor a cero
  //   And hace clic en "Registrar ingreso"
  //   Then el sistema debe registrar el movimiento correctamente
  //   And debe mostrar un mensaje de confirmación
  //   And el movimiento debe visualizarse en la lista de movimientos
  //   And el stock del producto debe incrementarse en inventario
  //   And el movimiento debe reflejarse en kardex

  await page.getByText("Productos y servicios").click();
  await page.getByText("Ingresos", { exact: true }).click();
  await page
    .locator(
      '[id="lgt_movimientos_content_cmp-header-movimientos.cmp-option-button:nuevo-movimiento"]',
    )
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^ALMACEN-AUTO$/ })
    .nth(2)
    .click();
  await page.getByText("ALMACEN-AUTO").nth(1).click();
  await page
    .locator("div")
    .filter({ hasText: /^INGRESO A ALMACÉN$/ })
    .nth(3)
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^INGRESO POR ABASTECIMIENTO$/ })
    .click();
  await page
    .getByRole("textbox", { name: "Buscar por nombre, código o c" })
    .click();
  await page
    .getByRole("textbox", { name: "Buscar por nombre, código o c" })
    .fill("111111");
  await page.getByText("Item para combos estricto").click();
  await page
    .locator(
      '[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]',
    )
    .click();
  await page
    .locator(
      '[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]',
    )
    .fill("150");
  await page.getByRole("button", { name: "REGISTRAR INGRESO" }).click();
  await page
    .locator(
      '[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:envio-whatsapp"]',
    )
    .click();
  await page.getByRole("textbox", { name: "Coloca el teléfono" }).click();
  await page
    .getByRole("textbox", { name: "Coloca el teléfono" })
    .fill("999999999");
  const page1Promise = page.waitForEvent("popup");
  await page.locator(".v-input-addon-button-text-container").click();
  const page1 = await page1Promise;
  await page
    .locator(
      '[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:envio-correo"]',
    )
    .click();
  await page
    .getByRole("textbox", { name: "email1@gmail.com, email2@" })
    .click();
  await page
    .getByRole("textbox", { name: "email1@gmail.com, email2@" })
    .click();
  await page
    .getByRole("textbox", { name: "email1@gmail.com, email2@" })
    .fill("srqapruebaserp2");
  await page
    .getByRole("textbox", { name: "email1@gmail.com, email2@" })
    .press("Alt+ControlOrMeta+@");
  await page
    .getByRole("textbox", { name: "email1@gmail.com, email2@" })
    .fill("srqapruebaserp2gmail.com");
  await page.locator(".v-input-addon-button-text-container").click();
  await page
    .locator(
      '[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:impresion-a4"]',
    )
    .click();
  await page
    .locator(
      '[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:impresion-ticket"]',
    )
    .click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .locator(
      '[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:descarga-pdf"]',
    )
    .click();
  const download = await downloadPromise;
  await page
    .getByRole("button", { name: "Ir al listado de movimientos" })
    .click();

  await page.getByText("Productos y servicios").click();
  await page.getByText("Stock de productos").click();
  await page
    .getByRole("textbox", { name: "Buscar por nombre, código o c" })
    .click();
  await page
    .getByRole("textbox", { name: "Buscar por nombre, código o c" })
    .fill("11111");
  await page
    .locator("div")
    .filter({ hasText: /^Varios\*$/ })
    .click();
  await page.getByText("Productos y servicios").click();
  await page.getByText("Kardex total").click();
  await page
    .getByRole("textbox", { name: "Buscar por nombre, código o c" })
    .click();
  await page
    .getByRole("textbox", { name: "Buscar por nombre, código o c" })
    .fill("111111");
  await page
    .locator("div")
    .filter({ hasText: /^Varios\*$/ })
    .click();
  await page.getByRole("button", { name: "Kardex por producto" }).click();
  await page.getByRole("button", { name: "VER DETALLE" }).first().click();
  await page.getByText("Productos y servicios").click();
  await page.getByText("Ingresos").click();

  // Scenario 2: Registrar ingreso con ítem con variante
  // Given que el usuario se encuentra en la pantalla "Nuevo ingreso de almacén"
  // And selecciona un almacén válido
  // And selecciona un motivo de ingreso válido
  // When busca un ítem con variantes
  // And selecciona una variante específica
  // And define una cantidad válida mayor a cero
  // And registra el ingreso
  // Then el sistema debe registrar el movimiento correctamente
  // And el stock de la variante debe incrementarse en inventario
  // And el movimiento debe reflejarse en kardex
  await page.getByText('Productos y servicios').click();
  await page.getByText('Ingresos', { exact: true }).click();
  await page.locator('[id="lgt_movimientos_content_cmp-header-movimientos.cmp-option-button:nuevo-movimiento"]').click();
  await page.locator('div').filter({ hasText: /^ALMACEN-AUTO$/ }).nth(2).click();
  await page.getByText("ALMACEN-AUTO").nth(1).click();
  await page.locator('div').filter({ hasText: /^INGRESO A ALMACÉN$/ }).nth(2).click();
  await page.locator('div').filter({ hasText: /^COMPRAS$/ }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('313131');
  await page.getByText('item con variante flexible').click();
  await page.getByText('Variante 1 flexible').click();
  await page.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').click();
  await page.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').fill('10');
  await page.getByRole('button', { name: 'REGISTRAR INGRESO' }).click();
  await page.locator('[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:envio-whatsapp"]').click();
  await page.getByRole('textbox', { name: 'Ej.' }).click();
  await page.getByRole('textbox', { name: 'Ej.' }).click();
  await page.getByRole('textbox', { name: 'Ej.' }).fill('963078103');
  const page1Promise = page.waitForEvent('popup');
  await page.locator('.v-input-addon-button-text-container').click();
  const page1 = await page1Promise;
  await page.locator('[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:envio-correo"]').click();
  await page.getByRole('textbox', { name: 'Ej. email1@gmail.com, email2@' }).click();
  await page.getByRole('textbox', { name: 'Ej. email1@gmail.com, email2@' }).fill('srqapruebaserp2@gmail.com');
  await page.locator('.v-input-addon-button-text-container').click();
  await page.locator('[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:impresion-a4"]').click();
  await page.locator('.icon.impresion-ticket').click();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:descarga-pdf"]').click();
  const download = await downloadPromise;
  await page.getByRole('button', { name: 'Ir al listado de movimientos' }).click();

  await page2.getByText('Productos y servicios').click();
  await page.getByText('Productos y servicios').click();
  await page.getByText('Stock de productos').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('313131');
  await page.getByText('Variante 1 flexible').click();
  const page2Promise = page.waitForEvent('popup');
  await page.getByRole('row', { name: '313131-V001 Variante 1' }).getByRole('button').click();
  const page2 = await page2Promise;
  await page2.getByRole('button', { name: 'VER DETALLE' }).nth(1).click();
  await page2.getByText('Productos y servicios').click();
  await page2.locator('.select-2 > .popup-container > .v-popup > span > .v-select > .v-select-plain > .v-select-base > .v-select-base-header > .v-select-header-plain > div > .v-select-header-plain-arrow').click();
  await page2.locator('[id="nvg_selects_cmp-header-selects_select:select-module-206-item-2016"]').click();
  await page2.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page2.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('313131');
  await page2.getByRole('row', { name: '313131-V001 Variante 1' }).getByRole('button').click();
  await page2.getByText('Productos y servicios').click();
  await page2.getByText('Ingresos').click();

  // Scenario: Registrar ingreso con ítem con equivalencia
  // Given que el usuario se encuentra en la pantalla "Nuevo ingreso de almacén"
  // And selecciona un almacén válido
  // And selecciona un motivo de ingreso válido
  // When busca un ítem con equivalencia
  // And selecciona el ítem
  // And define una cantidad válida mayor a cero
  // And registra el ingreso
  // Then el sistema debe registrar el movimiento correctamente
  // And debe respetar la lógica de equivalencia configurada
  // And el stock debe actualizarse en inventario según la equivalencia definida
  // And el movimiento debe reflejarse en kardex


  await page2.locator('[id="lgt_movimientos_content_cmp-header-movimientos.cmp-option-button:nuevo-movimiento"]').click();
  await page2.locator('div').filter({ hasText: /^ALMACEN-AUTO$/ }).nth(2).click();
  await page2.getByText('ALMACÉN DE VENTAS').click();
  await page2.locator('div').filter({ hasText: /^INGRESO A ALMACÉN$/ }).nth(2).click();
  await page2.getByText('INGRESO POR TRASLADO').click();
  await page2.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page2.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('202020');
  await page2.getByText('item equivalente flexible').click();
  await page2.getByText('Equivalente X2').click();
  await page2.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').click();
  await page2.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').click();
  await page2.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').fill('10');
  await page2.getByRole('button', { name: 'REGISTRAR INGRESO' }).click();
  await page2.locator('[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:envio-whatsapp"]').click();
  await page2.getByRole('textbox', { name: 'Ej.' }).click();
  await page2.getByRole('textbox', { name: 'Ej.' }).fill('963078103');
  const page3Promise = page2.waitForEvent('popup');
  await page2.locator('.v-input-addon-button-text-container').click();
  const page3 = await page3Promise;
  const page3Promise = page2.waitForEvent('popup');
  await page2.locator('.v-input-addon-button-text-container').click();
  const page3 = await page3Promise;
  await page2.locator('[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:envio-correo"]').click();
  await page2.getByRole('textbox', { name: 'Ej. email1@gmail.com, email2@' }).click();
  await page2.getByRole('textbox', { name: 'Ej. email1@gmail.com, email2@' }).fill('srqapruebaserp2');
  await page2.getByRole('textbox', { name: 'Ej. email1@gmail.com, email2@' }).press('Alt+ControlOrMeta+@');
  await page2.getByRole('textbox', { name: 'Ej. email1@gmail.com, email2@' }).fill('srqapruebaserp2@gmail.com');
  await page2.locator('.v-input-addon-button-text-container').click();
  await page2.getByText('Enviar', { exact: true }).click();
  await page2.locator('[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:impresion-a4"]').click();// las opciones de cancelar playwright no lo detecta como cancelariamos la impresión?
  await page2.locator('[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:impresion-ticket"]').click();// las opciones de cancelar playwright no lo detecta como cancelariamos la impresión?
  const download1Promise = page2.waitForEvent('download');
  await page2.locator('[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:descarga-pdf"]').click();
  const download1 = await download1Promise;
  await page2.getByRole('button', { name: 'Ir al listado de movimientos' }).click();
  await page2.getByText('Productos y servicios').click();
  await page2.getByText('Stock de productos').click();
  await page2.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page2.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('202020');
  await page2.locator('div').filter({ hasText: /^Varios\*$/ }).click();
  const page4Promise = page2.waitForEvent('popup');
  await page2.getByRole('button', { name: 'Ver Kardex' }).click();
  const page4 = await page4Promise;
  await page4.getByRole('button', { name: 'VER DETALLE' }).first().click();
  await page4.getByText('Ingresos').click();


  // Scenario: Validar cantidad inválida en ingreso
  // Given que el usuario agrega un ítem válido a la grilla
  // When intenta registrar con cantidad igual a cero
  // Then el sistema no debe permitir registrar el movimiento
  // And debe mostrar una validación visible

    
  await page.getByText('Productos y servicios').click();
  await page.locator('[id="nvg_selects_cmp-header-selects_select:select-module-204-item-2008"]').click();
  await page.locator('[id="lgt_movimientos_content_cmp-header-movimientos.cmp-option-button:nuevo-movimiento"]').click();
  await page.locator('div').filter({ hasText: /^ALMACEN-AUTO$/ }).nth(2).click();
  await page.getByText('ALMACEN-AUTO').nth(1).click();
  await page.locator('.motivo > .form-control > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form > .v-select-header-form-arrow').click();
  await page.getByText('INGRESO POR TRASLADO').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('111111');
  await page.getByText('Item para combos estricto').click();
  await page.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').click();
  await page.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').fill('0000');
  await page.getByRole('button', { name: 'REGISTRAR INGRESO' }).click();
  await page.getByText('Error al generar MovimientoLas cantidades de los ítems deben ser mayores a cero.').click();
  await page.locator('.v-modal > div').first().click();
  await page.getByRole('button', { name: 'CANCELAR' }).click();

  // Scenario: Validar duplicidad de ítems en ingreso
  //   Given que el usuario agrega un ítem válido
  //   When intenta agregar el mismo ítem nuevamente
  //   Then el sistema no debe crear otra fila
  //   And la cantidad del item en la lista incrementa a 2
  await page.locator('[id="lgt_movimientos_content_cmp-header-movimientos.cmp-option-button:nuevo-movimiento"]').click();
  await page.locator('[id="lgt_movimientos_content_cmp-header-movimientos.li:nuevo-ingreo"]').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('111111');
  await page.getByText('Pproducto111111Item para combos estricto gravado160 un').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('111111');
  await page.getByText('Pproducto111111Item para combos estricto gravado160 un').click();
  await page.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').click();
  await page.getByRole('button', { name: 'LIMPIAR' }).click();
  await page.getByRole('button', { name: 'Limpiar', exact: true }).click();
  await page.locator('.v-modal > div').first().click();
   //Aqui sali despues a la lista de movimientos, pero no se si es necesario agregarlo o no, lo dejo a tu criterio
  await page.getByRole('button', { name: 'CANCELAR' }).click();
  

  // Scenario: Registrar ingreso con datos adicionales
  // Given que el usuario registra un ingreso válido
  // When agrega datos adicionales
  // And guarda los datos
  // And registra el ingreso
  // Then el movimiento debe guardar la información adicional
  // And el stock debe incrementarse en inventario
  // And el movimiento debe reflejarse en kardex


  await page.locator('[id="lgt_movimientos_content_cmp-header-movimientos.cmp-option-button:nuevo-movimiento"]').click();
  await page.locator('[id="lgt_movimientos_content_cmp-header-movimientos.li:nuevo-ingreo"]').click();
  await page.getByRole('button', { name: 'Datos opcionales' }).click();
  await page.getByRole('textbox', { name: 'Buscar proveedor por nombre o' }).click();
  await page.getByRole('button', { name: 'Agregar proveedor' }).click();
  await page.locator('[id="pv_conductores_form-registro-relacionado-entidad:form_basico:v-select:tipo-documento"]').nth(5).click();
  await page.locator('div').filter({ hasText: /^DNI$/ }).nth(4).click();
  await page.locator('[id="pv_conductores_form-registro-relacionado-entidad:form_basico:v-input:num-document"]').click();
  await page.locator('[id="pv_conductores_form-registro-relacionado-entidad:form_basico:v-input:num-document"]').fill('76975258
  await page7.getByRole('textbox', { name: 'Ej. Ladrillería Distribuidora' }).click();');
  await page.getByRole('button', { name: 'Consultar SUNAT/RENIEC' }).click();
  await page.getByRole('textbox', { name: 'Ej. Calle Los Manzanos 120,' }).click();
  await page.getByRole('textbox', { name: 'Ej. Calle Los Manzanos 120,' }).fill('av-ejemplo-auto');
  await page.getByRole('textbox', { name: 'Ej. 954588556' }).click();
  await page.getByRole('textbox', { name: 'Ej. 954588556' }).fill('99999999');
  await page.getByRole('textbox', { name: 'Ej. usuario@correo.com' }).click();
  await page.getByRole('textbox', { name: 'Ej. usuario@correo.com' }).fill('ejemploauto');
  await page.getByRole('textbox', { name: 'Ej. usuario@correo.com' }).press('Alt+ControlOrMeta+@');
  await page.getByRole('textbox', { name: 'Ej. usuario@correo.com' }).fill('ejemploauto@gmail.com');
  await page.getByRole('button', { name: 'Crear proveedor' }).click();
  await page.getByRole('button', { name: 'Guardar datos' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('111111');
  await page.getByText('Item para combos estricto').click();
  await page.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').click();
  await page.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').fill('10');
  await page.getByRole('button', { name: 'REGISTRAR INGRESO' }).click();
  await page.getByRole('button', { name: 'Ir al listado de movimientos' }).click();
  await page.getByText('Productos y servicios').click();
  await page.getByText('Stock de productos').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('111111');
  await page.locator('div').filter({ hasText: /^Varios\*$/ }).click();
  const page5Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Ver Kardex' }).click();
  const page5 = await page5Promise;
  await page5.getByRole('button', { name: 'VER DETALLE' }).nth(1).click();
  await page5.getByText('M001-I-1072').click();
  await page5.getByText('Datos opcionales').click();
  await page5.locator('.v-modal > div').first().click();

// # ===================== SALIDA =====================
//
//   Scenario: Registrar salida correctamente y reflejar disminución de stock
//   Given que el usuario se encuentra en la pantalla "Nueva salida de almacén"
//   And selecciona un almacén válido
//   And selecciona un motivo válido
//   When agrega un ítem válido con cantidad mayor a cero
//   And registra la salida
//   Then el sistema debe registrar el movimiento correctamente
//   And el stock del ítem debe disminuirse en inventario
//   And el movimiento debe reflejarse en kardex
  
  await page.getByText('Productos y servicios').click();
  await page.getByText('Salidas').click();
  await page.locator('[id="lgt_movimientos_content_cmp-header-movimientos.cmp-option-button:nuevo-movimiento"]').click();
  await page.locator('div').filter({ hasText: /^ALMACEN-AUTO$/ }).nth(2).click();
  await page.getByText('ALMACÉN DE VENTAS').click();
  await page.locator('div').filter({ hasText: /^SALIDA POR VENTA$/ }).nth(2).click();
  await page.getByText('SALIDA POR VENTA').nth(1).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('121212');
  await page.getByText('item para combos gravado').click();
  await page.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').click();
  await page.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').fill('10');
  await page.locator('div').filter({ hasText: /^REGISTRAR SALIDA$/ }).first().click();
  await page.getByText('Registrar y despachar').click();
  await page.locator('[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:envio-whatsapp"]').click();
  await page.getByRole('textbox', { name: 'Ej.' }).click();
  await page.getByRole('textbox', { name: 'Ej.' }).fill('963078103');
  const page1Promise = page.waitForEvent('popup');
    await page.locator('.v-input-addon-button-text-container').click();
    const page1 = await page1Promise;
  await page.locator('.icon.email').click();
  await page.getByRole('textbox', { name: 'Ej. email1@gmail.com, email2@' }).click();
  await page.getByRole('textbox', { name: 'Ej. email1@gmail.com, email2@' }).fill('srqapruebaserp2');
  await page.getByRole('textbox', { name: 'Ej. email1@gmail.com, email2@' }).press('Alt+ControlOrMeta+@');
  await page.getByRole('textbox', { name: 'Ej. email1@gmail.com, email2@' }).fill('srqapruebaserp2@gmail.com');

  await page.getByText('Enviar', { exact: true }).click();
  await page.locator('[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:impresion-a4"]').click();
  await page.locator('.icon.impresion-ticket').click();
  const downloadPromise = page.waitForEvent('download');
    await page.locator('[id="lgt_reg-movimiento_v-modal:resultado-registro-movimiento_div:descarga-pdf"] div').filter({ hasText: /^Descargar PDF$/ }).click();
    const download = await downloadPromise;
  await page.getByRole('button', { name: 'Ir al listado de movimientos' }).click();
  await page.getByText('Productos y servicios').click();
  await page.locator('div').filter({ hasText: /^Stock de productos$/ }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('121212');
  await page.locator('.arrow').click();
  const page2Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Ver Kardex' }).click();
    const page2 = await page2Promise;
  await page2.getByRole('button', { name: 'VER DETALLE' }).nth(1).click();
  await page2.getByText('M001-S-1074').click();
  await page2.locator('.v-modal > div').first().click();

//   Scenario: Registrar salida con insumo
//   Given que el usuario selecciona un insumo válido
//   When registra la salida
//   Then el stock del insumo debe disminuirse en inventario
//   And el movimiento debe reflejarse en kardex
    
  await page2.getByText('Productos y servicios').click();
  await page2.locator('[id="nvg_selects_cmp-header-selects_select:select-module-204-item-2009"]').click();
  await page2.locator('[id="lgt_movimientos_content_cmp-header-movimientos.cmp-option-button:nuevo-movimiento"]').click();
  await page2.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page2.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('666444');
  await page2.getByText('nuevo insumo flexible').click();
  await page2.locator('div').filter({ hasText: /^REGISTRAR SALIDA$/ }).first().click();
  await page2.getByText('Registrar y despachar').click();
  await page2.getByRole('button', { name: 'Ir al listado de movimientos' }).click();
  await page2.getByText('Productos y servicios').click();
  await page2.getByText('Stock de productos').click();
  await page2.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page2.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('666444');
  await page2.getByText('Varios*').click();
  await page2.getByText('Productos y servicios').click();
  await page2.getByText('Kardex total').click();
  await page2.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page2.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('666444');
  await page2.getByText('Varios*').click();
  const page4Promise = page2.waitForEvent('popup');
    await page2.getByRole('button', { name: 'Ver Kardex' }).click();
    const page4 = await page4Promise;
  await page4.getByRole('button', { name: 'VER DETALLE' }).nth(1).click();
  await page4.getByText('SALIDA POR VENTA').click();
  await page4.getByText('M001-S-').click();
  await page4.locator('.v-modal > div').first().click();

//   Scenario: Registrar salida con variante
//   Given que el usuario selecciona una variante
//   When registra la salida
//   Then el stock de la variante debe disminuirse en inventario
//   And el movimiento debe reflejarse en kardex
  
  await page4.locator('[id="lgt_movimientos_content_cmp-header-movimientos.cmp-option-button:nuevo-movimiento"]').click();
  await page4.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page4.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('313131');
  await page4.getByText('item con variante flexible').click();
  await page4.getByText('Variante 2 flexible').click();
  await page4.getByText('REGISTRAR SALIDA').click();
  await page4.getByText('Registrar y despachar').click();
  await page4.getByRole('button', { name: 'Ir al listado de movimientos' }).click();
  await page4.getByText('Productos y servicios').click();
  await page4.getByText('Stock de productos').click();
  await page4.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page4.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('313131');
  await page4.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).press('AudioVolumeUp');
  await page4.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).press('AudioVolumeUp');
  await page4.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).press('AudioVolumeUp');
  await page4.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).press('AudioVolumeUp');
  await page4.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).press('AudioVolumeUp');
  await page4.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).press('AudioVolumeDown');
  await page4.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).press('AudioVolumeDown');
  await page4.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).press('AudioVolumeDown');
  await page4.getByText('Variante 2 flexible').click();
  const page5Promise = page4.waitForEvent('popup');
    await page4.getByRole('row', { name: '313131-V002 Variante 2' }).getByRole('button').click();
    const page5 = await page5Promise;
  await page5.getByRole('button', { name: 'VER DETALLE' }).nth(1).click();
  await page5.getByText('M001-S-').click();
  await page5.locator('.v-modal > div').first().click();

//   Scenario: Registrar salida con ítem con equivalencia
//   Given que el usuario se encuentra en la pantalla "Nueva salida de almacén"
//   And selecciona un almacén válido
//   And selecciona un motivo de salida válido
//   When busca un ítem con equivalencia
//   And selecciona el ítem equivalente
//   And define una cantidad válida mayor a cero
//   And registra la salida
//   Then el sistema debe registrar el movimiento correctamente
//   And debe respetar la lógica de equivalencia configurada
//   And el stock debe actualizarse en inventario según la equivalencia definida
//   And el movimiento debe reflejarse en kardex
await page5.locator('[id="lgt_movimientos_content_cmp-header-movimientos.cmp-option-button:nuevo-movimiento"]').click();
  await page5.locator('div').filter({ hasText: /^ALMACEN-AUTO$/ }).nth(2).click();
  await page5.getByText('ALMACÉN DE VENTAS').click();
  await page5.getByText('SALIDA POR VENTA').first().click();
  await page5.getByText('SALIDA DE INSUMOS').click();
  await page5.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page5.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('202020');
  await page5.getByText('item equivalente flexible').click();
  await page5.getByText('item equivalente flexible').first().click();
  await page5.locator('div').filter({ hasText: /^REGISTRAR SALIDA$/ }).first().click();
  await page5.getByText('Registrar y despachar').click();
  await page5.getByRole('button', { name: 'Ir al listado de movimientos' }).click();
  await page5.getByText('Productos y servicios').click();
  await page5.getByText('Stock de productos').click();
  await page5.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page5.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('202020');
  await page5.getByText('Varios*').click();
  const page6Promise = page5.waitForEvent('popup');
    await page5.getByRole('button', { name: 'Ver Kardex' }).click();
    const page6 = await page6Promise;
  await page6.getByRole('button', { name: 'VER DETALLE' }).first().click();
  await page6.getByText('M001-S-').click();
  await page6.locator('.v-modal > div').first().click();


// Scenario: Despachar salida correctamente liberando stock comprometido
//   Given que existe una salida registrada en estado por despachar
//   And el stock se encuentra comprometido en inventario
//   When el usuario ejecuta la acción "Despachar salida"
//   Then el sistema debe actualizar el estado del movimiento
//   And el stock debe mantenerse descontado según la lógica del sistema
//   And la acción debe reflejarse en kardex
//   And debe registrarse el evento en la bitácora


  await page.getByText('Productos y servicios').first().click();
  await page.locator('[id="nvg_selects_cmp-header-selects_select:select-module-204-item-2009"]').click();
  await page.getByText('Agregar salida').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('313131');
  await page.getByText('item con variante flexible').click();
  await page.getByText('Variante 3 flexible').click();
  await page.getByText('REGISTRAR SALIDA').click();
  await page.getByText('Registrar', { exact: true }).click();
  await page.getByRole('button', { name: 'Ir al listado de movimientos' }).click();
  await page.getByText('Productos y servicios').click();
  await page.getByText('Stock de productos').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('313131');
  await page.getByText('Stock comprometido').click();
  await page.getByText('Productos y servicios').click();
  await page.getByText('Salidas').click();
  await page.locator('.cmp-dropdown-toggle.justify-content-center').first().click();
  await page.getByText('Despachar salida').click();
  await page.getByRole('button', { name: 'DESPACHAR SALIDA' }).click();
  await page.locator('.v-modal > div').first().click();
  await page.getByText('Productos y servicios').click();
  await page.getByText('Stock de productos').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('313131');
  await page.getByText('Variante 3 flexible').click();
  const page7Promise = page.waitForEvent('popup');
    await page.getByRole('row', { name: '313131-V003 Variante 3' }).getByRole('button').click();
    const page7 = await page7Promise;
  await page7.getByRole('button', { name: 'VER DETALLE' }).nth(1).click();
  await page7.getByText('M001-S-1079').click();
  await page7.locator('.v-modal > div').first().click();

//   Scenario: Registrar salida con datos adicionales
//   Given que el usuario registra una salida válida
//   When agrega datos adicionales
//   And guarda
//   And registra la salida
//   Then el movimiento debe guardar la información adicional
//   And el stock debe disminuirse en inventario
//   And el movimiento debe reflejarse en kardex

  await page.getByText('Agregar salida').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('121212');
  await page.getByText('item para combos gravado').click();
  await page.getByRole('button', { name: 'Datos opcionales' }).click();
  await page.getByRole('textbox', { name: 'Buscar cliente por nombre o n' }).click();
  await page.getByText('DNIDNI7697525899999999JHUNIOR').click();
  await page.getByRole('button', { name: 'Guardar datos' }).click();
  await page.getByText('REGISTRAR SALIDA').click();
  await page.getByText('Registrar y despachar').click();
  await page.getByRole('button', { name: 'Ir al listado de movimientos' }).click();
  await page.getByText('Productos y servicios').click();
  await page.getByText('Stock de productos').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('121212');
  await page.getByText('Varios*').click();
  const page8Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Ver Kardex' }).click();
    const page8 = await page8Promise;
  await page8.getByRole('button', { name: 'VER DETALLE' }).nth(1).click();
  await page8.getByText('M001-S-1081').click();
  await page8.getByText('Datos opcionales').click();
  await page8.locator('.v-modal > div').first().click();
  await page8.locator('body').press('Tab');


// # ===================== AJUSTE =====================

// Scenario: Registrar ajuste tipo Agregar
//   Given que el usuario agrega un ítem válido
//   When selecciona tipo "Agregar"
//   And registra el ajuste
//   Then el stock debe incrementarse en inventario
//   And el movimiento debe reflejarse en kardex

  await page8.getByText('Productos y servicios').click();
  await page8.getByText('Ajustes').click();
  await page8.getByText('Agregar ajuste').click();
  await page8.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page8.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('111111');
  await page8.getByText('Item para combos estricto').click();
  await page8.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').click();
  await page8.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').press('ArrowRight');
  await page8.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').fill('500');
  await page8.locator('div').filter({ hasText: /^Agregar$/ }).nth(1).click();
  await page8.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-select:factor_v-option:opcion-1"]').getByText('Agregar').click();
  await page8.getByRole('button', { name: 'REGISTRAR AJUSTE' }).click();
  await page8.getByRole('button', { name: 'Ir al listado de movimientos' }).click();
  await page8.getByText('Productos y servicios').click();
  await page8.getByText('Stock de productos').click();
  await page8.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page8.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('111111');
  await page8.getByText('Varios*').click();
  await page8.getByRole('table').getByText('ALMACEN-AUTO').click();
  const page9Promise = page8.waitForEvent('popup');
    await page8.getByRole('button', { name: 'Ver Kardex' }).click();
    const page9 = await page9Promise;
  await page9.getByRole('button', { name: 'VER DETALLE' }).nth(1).click();
  await page9.getByText('M001-A-1082').click();
  await page9.locator('.v-modal > div').first().click();

// Scenario: Registrar ajuste tipo Quitar
//   Given que el usuario agrega un ítem válido
//   When selecciona tipo "Quitar"
//   And registra el ajuste
//   Then el stock debe disminuirse en inventario
//   And el movimiento debe reflejarse en kardex


  await page9.getByText('Productos y servicios').click();
  await page9.locator('[id="nvg_selects_cmp-header-selects_select:select-module-204-item-2011"]').click();
  await page9.getByText('Agregar ajuste').click();
  await page9.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page9.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('111111');
  await page9.getByText('Item para combos estricto').click();
  await page9.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').click();
  await page9.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').press('ArrowRight');
  await page9.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').fill('400');
  await page9.locator('div').filter({ hasText: /^Agregar$/ }).nth(1).click();
  await page9.getByText('Quitar').click();
  await page9.getByRole('button', { name: 'REGISTRAR AJUSTE' }).click();
  await page9.getByRole('button', { name: 'Ir al listado de movimientos' }).click();
  await page9.getByText('Productos y servicios').click();
  await page9.getByText('Stock de productos').click();
  await page9.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page9.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('111111');
  await page9.getByText('Varios*').click();
  const page10Promise = page9.waitForEvent('popup');
    await page9.getByRole('button', { name: 'Ver Kardex' }).click();
    const page10 = await page10Promise;
  await page10.getByRole('button', { name: 'VER DETALLE' }).nth(1).click();
  await page10.getByText('M001-A-1084').click();
  await page10.locator('.v-modal > div').first().click();

// Scenario: Registrar ajuste con insumo
//   Given que el usuario agrega un insumo
//   When registra el ajuste
//   Then el stock debe actualizarse en inventario
//   And el movimiento debe reflejarse en kardex

  await page10.getByText('Productos y servicios').click();
  await page10.getByText('Ajustes').click();
  await page10.getByText('Agregar ajuste').click();
  await page10.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page10.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('464646');
  await page10.getByText('Nuevo insumo test1').click();
  await page10.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').click();
  await page10.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').press('ArrowRight');
  await page10.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').fill('500');
  await page10.locator('div').filter({ hasText: /^Agregar$/ }).nth(1).click();
  await page10.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-select:factor_v-option:opcion-1"]').getByText('Agregar').click();
  await page10.getByRole('button', { name: 'REGISTRAR AJUSTE' }).click();
  await page10.getByRole('button', { name: 'Ir al listado de movimientos' }).click();
  await page10.getByText('Productos y servicios').click();
  await page10.getByText('Stock de productos').click();
  await page10.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page10.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('464646');
  await page10.getByText('Varios*').click();
  const page11Promise = page10.waitForEvent('popup');
    await page10.getByRole('button', { name: 'Ver Kardex' }).click();
    const page11 = await page11Promise;
  await page11.getByRole('button', { name: 'VER DETALLE' }).nth(1).click();
  await page11.getByText('M001-A-1085').click();
  await page11.locator('.v-modal > div').first().click();
// Scenario: Registrar ajuste con equivalencia
//   Given que el usuario agrega un ítem con equivalencia
//   When registra el ajuste
//   Then debe respetar la equivalencia
//   And el stock debe actualizarse en inventario según la equivalencia definida
//   And el movimiento debe reflejarse en kardex

await page11.getByText('Productos y servicios').click();
await page11.getByText('Ajustes').click();
await page11.getByText('Agregar ajuste').click();
await page11.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
await page11.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('101010');
await page11.getByText('item equivalente estricto').click();
await page11.getByText('item equivalente estricto gravadoFactor Multiplicador:1S/').click();
await page11.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').click();
await page11.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').press('ArrowRight');
await page11.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-step:cantidad"]').fill('10');
await page11.locator('div').filter({ hasText: /^Agregar$/ }).nth(1).click();
await page11.locator('[id="lgt_reg-movimiento_cmp-grid-items-movimiento:body_v-grid:body-grilla_v-select:factor_v-option:opcion-1"]').getByText('Agregar').click();
await page11.getByRole('button', { name: 'REGISTRAR AJUSTE' }).click();
await page11.getByRole('button', { name: 'Ir al listado de movimientos' }).click();
await page11.getByText('Productos y servicios').click();
await page11.getByText('Stock de productos').click();
await page11.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
await page11.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('101010');
await page11.getByText('item equivalente estricto').click();
await page11.getByText('Varios*').click();
const page12Promise = page11.waitForEvent('popup');
  await page11.getByRole('button', { name: 'Ver Kardex' }).click();
  const page12 = await page12Promise;
await page12.getByRole('button', { name: 'VER DETALLE' }).nth(1).click();
await page12.getByText('M001-A-1086').click();
await page12.locator('.v-modal > div').first().click();
// crtl + shift + L para selecionar todo las variantes iguales


// Scenario: Registrar ajuste con datos adicionales
//   Given que el usuario registra un ajuste válido
//   When agrega datos adicionales
//   And guarda
//   And registra el ajuste
//   Then debe guardar la información adicional
//   And el stock debe actualizarse en inventario
//   And el movimiento debe reflejarse en kardex



await page.getByText('Productos y servicios').click();
await page.getByText('Ajustes').click();
await page.locator('[id="lgt_movimientos_content_cmp-header-movimientos.cmp-option-button:nuevo-movimiento"]').click();
await page.locator('div').filter({ hasText: /^ALMACEN-AUTO$/ }).nth(3).click();
await page.getByText('ALMACÉN DE VENTAS').click();
await page.getByText('AJUSTE POR ACTUALIZACIÓN DE').first().click();
await page.getByText('AJUSTE VENCIMIENTO').click();
await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('111111');
await page.getByText('Item para combos estricto').click();
await page.getByRole('button', { name: 'Datos opcionales' }).click();
await page.getByRole('textbox', { name: 'Buscar proveedor por nombre o' }).click();
await page.getByRole('textbox', { name: 'Buscar proveedor por nombre o' }).fill('76975258');
await page.getByText('JHUNIOR BRAYAN GUTIERREZ').click();
await page.getByText('Nuevo campo adicional').click();
await page.getByText('Campo de texto').click();
await page.getByRole('textbox', { name: 'Digite el nombre del nuevo' }).click();
await page.getByRole('textbox', { name: 'Digite el nombre del nuevo' }).fill('nombre');
await page.getByRole('button', { name: 'Crear campo' }).click();
await page.locator('.v-modal > div').first().click();
await page.locator('[id="lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]').click();
await page.locator('[id="lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]').fill('auto');
await page.getByText('Nuevo campo adicional').click();
await page.getByText('Campo de fecha').click();
await page.getByRole('textbox', { name: 'Digite el nombre del nuevo' }).click();
await page.getByRole('textbox', { name: 'Digite el nombre del nuevo' }).fill('fecha');
await page.getByRole('button', { name: 'Crear campo' }).click();
await page.locator('.v-modal > div').first().click();
await page.locator('[id="lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-datepicker:campo-fecha-0"]').click();
await page.getByRole('button', { name: 'jueves, 30 de abr de' }).click();
await page.getByText('Nuevo campo adicional').click();
await page.getByText('Campo de selección').click();
await page.getByRole('textbox', { name: 'Digite el nombre del nuevo' }).click();
await page.getByRole('textbox', { name: 'Digite el nombre del nuevo' }).fill('entorno');
await page.locator('[id="lgt_cmp-registro-movimiento_v-modal:cmp-gestion-campo-adicional-seleccion_v-input:opcion-0"]').click();
await page.locator('[id="lgt_cmp-registro-movimiento_v-modal:cmp-gestion-campo-adicional-seleccion_v-input:opcion-0"]').fill('certificación');
await page.locator('[id="lgt_cmp-registro-movimiento_v-modal:cmp-gestion-campo-adicional-seleccion_v-input:opcion-1"]').click();
await page.locator('[id="lgt_cmp-registro-movimiento_v-modal:cmp-gestion-campo-adicional-seleccion_v-input:opcion-1"]').fill('producción');
await page.locator('.v-checkbox-default-label > span').first().click();
await page.getByRole('button', { name: 'Crear campo' }).click();
await page.locator('.v-modal > div').first().click();
await page.getByText('Nuevo campo adicional').click();
await page.getByText('Campo de número').click();
await page.getByRole('textbox', { name: 'Digite el nombre del nuevo' }).click();
await page.getByRole('textbox', { name: 'Digite el nombre del nuevo' }).fill('numero de test');
await page.locator('[id="lgt_cmp-registro-movimiento_v-modal:cmp-gestion-campo-adicional-generico_v-input:valor-por-defecto"]').click();
await page.getByRole('button', { name: 'Crear campo' }).click();
await page.locator('.v-modal > div').first().click();
await page.locator('[id="lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]').click();
await page.locator('[id="lgt_reg-movimiento_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]').fill('98989898989898989');
await page.getByRole('button', { name: 'Guardar datos' }).click();
// # ===================== TRASLADO =====================

// Scenario: Registrar traslado correctamente
//   Given que el usuario selecciona almacén origen y destino distintos
//   When agrega un ítem válido
//   And registra el traslado
//   Then el sistema debe guardar el movimiento
//   And el stock debe actualizarse en inventario según el traslado
//   And el movimiento debe reflejarse en kardex

// Scenario: Validar traslado con mismo almacén
//   Given que el usuario selecciona el mismo almacén
//   When intenta registrar
//   Then el sistema no debe permitir

// Scenario: Registrar traslado con variante
//   Given que el usuario usa una variante
//   When registra el traslado
//   Then el stock de la variante debe actualizarse en inventario
//   And el movimiento debe reflejarse en kardex

// Scenario: Registrar traslado con datos adicionales
//   Given que el usuario registra un traslado válido
//   When agrega datos adicionales
//   And registra
//   Then debe guardarse la información adicional
//   And el stock debe actualizarse en inventario
//   And el movimiento debe reflejarse en kardex

// Scenario: Registrar traslado por confirmar correctamente
//   Given que el usuario se encuentra en la pantalla "Nuevo traslado de almacén"
//   And selecciona un almacén origen válido
//   And selecciona un almacén destino distinto al origen
//   And selecciona un motivo válido
//   When agrega un ítem válido con cantidad mayor a cero
//   And registra el traslado en estado por confirmar
//   Then el sistema debe registrar el movimiento correctamente
//   And el movimiento debe quedar en estado por confirmar
//   And el stock del almacén de salida debe afectarse

// Scenario: Confirmar traslado correctamente
//   Given que existe un traslado registrado en estado por confirmar
//   When el usuario ejecuta la acción "Confirmar traslado"
//   Then el sistema debe actualizar el estado del movimiento
//   And el stock del ítem debe actualizarse en inventario según el traslado
//   And la confirmación debe reflejarse en kardex
//   And debe registrarse el evento en la bitácora

// # ===================== EDICIÓN =====================

// Scenario: Editar movimiento correctamente
//   Given que existe un movimiento
//   When el usuario modifica la cantidad
//   And guarda cambios
//   Then el movimiento debe actualizarse
//   And el stock debe actualizarse en inventario
//   And la actualización debe reflejarse en kardex

// Scenario: Editar movimiento con variante
//   Given que el movimiento contiene variante
//   When modifica la cantidad
//   Then el stock de la variante debe actualizarse en inventario
//   And la actualización debe reflejarse en kardex

// Scenario: Editar movimiento con control estricto válido
//   Given que el ítem tiene control estricto
//   When edita correctamente
//   Then debe permitir guardar
//   And la actualización debe reflejarse en kardex

// Scenario: Bloquear edición por integridad
//   Given que la edición afecta la integridad
//   When intenta guardar
//   Then el sistema no debe permitir

// Scenario: Editar movimiento con datos adicionales
//   Given que el usuario edita
//   When actualiza datos adicionales
//   Then deben persistir

// # ===================== CLONAR =====================

// Scenario: Clonar movimiento correctamente
//   Given que existe un movimiento
//   When clona y registra
//   Then el nuevo movimiento debe guardarse
//   And el stock debe actualizarse en inventario
//   And el movimiento debe reflejarse en kardex

// Scenario: Clonar movimiento con equivalencia
//   Given que el ítem tiene equivalencia
//   When clona
//   Then debe respetarse la lógica
//   And el movimiento debe reflejarse en kardex

// Scenario: Clonar movimiento con datos adicionales
//   Given que clona
//   When agrega datos adicionales
//   Then deben guardarse

// # ===================== ELIMINACIÓN =====================

// Scenario: Eliminar movimiento correctamente
//   Given que existe un movimiento
//   When elimina
//   Then el stock debe actualizarse en inventario
//   And la eliminación debe reflejarse en kardex

// Scenario: Eliminar movimiento con variante
//   Given que tiene variante
//   When elimina
//   Then el stock de la variante debe actualizarse en inventario
//   And la eliminación debe reflejarse en kardex

// Scenario: Bloquear eliminación por stock negativo
//   Given que eliminar genera stock negativo
//   When intenta eliminar
//   Then no debe permitir


// # ===================== MASIVO =====================

// Scenario: Registrar movimiento masivo correctamente
//   Given que carga una estructura válida
//   When ejecuta el proceso
//   Then se generan movimientos
//   And deben reflejarse en inventario
//   And deben reflejarse en kardex

// Scenario: Movimiento masivo con productos e insumos
//   Given que incluye productos e insumos
//   When procesa
//   Then el stock debe actualizarse en inventario
//   And los movimientos deben reflejarse en kardex

// # ===================== ACCIONES =====================

// Scenario: Imprimir movimiento
//   Given que existe un movimiento
//   When imprime
//   Then debe generarse el documento

// Scenario: Enviar movimiento
//   Given que existe un movimiento
//   When envía
//   Then debe procesarse correctamente

// Scenario: Descargar PDF
//   Given que existe un movimiento
//   When descarga
//   Then el archivo debe generarse

// # ===================== EXPORTACIONES =====================

// Scenario: Exportar movimientos
//   Given que aplica filtros
//   When exporta
//   Then el archivo debe generarse

// Scenario: Exportar movimientos detallados
//   Given que aplica filtros
//   When exporta
//   Then debe generarse correctamente

// # ===================== MOVIMIENTOS RÁPIDOS =====================

// Scenario: Aumentar stock desde modal
//   Given que abre "Aumentar stock"
//   When registra datos válidos
//   Then el stock debe incrementarse en inventario
//   And el movimiento debe reflejarse en kardex

// Scenario: Aumentar stock con variante
//   Given que tiene variante
//   When registra
//   Then el stock de la variante debe incrementarse en inventario
//   And el movimiento debe reflejarse en kardex

// Scenario: Disminuir stock desde modal
//   Given que abre salida rápida
//   When registra datos válidos
//   Then el stock debe disminuirse en inventario
//   And el movimiento debe reflejarse en kardex

// Scenario: Disminuir stock con insumo
//   Given que es insumo
//   When registra
//   Then el stock debe disminuirse en inventario
//   And el movimiento debe reflejarse en kardex

// # ===================== DATOS ADICIONALES =====================

// Scenario: Registrar datos adicionales correctamente
//   Given que abre "Datos opcionales"
//   When guarda información válida
//   Then debe asociarse al movimiento

// Scenario: Agregar documento relacionado
//   Given que agrega documento
//   When completa datos
//   Then se guarda

// Scenario: Validar documento incompleto
//   Given que faltan campos
//   When intenta guardar
//   Then no debe permitir
  });