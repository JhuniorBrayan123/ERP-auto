import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto("https://erpperu2-crt.smartclic.pe/auth/login");

  //     Feature: Selección, edición y descuentos por ítem en caja de venta
  // el flujo desde el home ya sabemos que es de ventas y compras y ahi a cajas estavez en todos Y ir a cadas por su Id: id="nvg_selects_cmp-header-selects_select:select-module-106-item-1012" (Botonde ver cajas)

  // Scenario: Filtrar ítems por almacén
  //   Given que el usuario se encuentra dentro de una caja
  //   When selecciona un almacén válido en el filtro "Almacén"
  //   Then el sistema debe actualizar la grilla de ítems según el almacén seleccionado

  await page.getByText("Ventas y compras").click();
  await page.getByText("Ver cajas").click();
  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page.getByText("ALMACEN-AUTO").first().click();
  await page.getByText("ALMACÉN DE VENTAS").click();
  await page.getByRole("link", { name: "2" }).click(); // esto es el paginado de la lista de productos en la caja
  await page.getByRole("link", { name: "3" }).click();

  //Esto ya es mio que estoy sugiriendo seleccionar un item cualquiera : <div data-v-21f52694="" class="image space"><div data-v-21f52694="" class="image-default"></div><!----></div> este es igual en todos los que no tienen imagen entonces niguno de los items por ahora tiene imagen entonces luego se validaria en el DOM que se agregue el item al carrito

  await page.locator(".image-default").first().click();
  await page.locator(".item").click(); // Este seria el expect o que el item se vea seleccionado o agregado al carrito o algo asi para validar que se selecciono el item

  // Scenario: Filtrar ítems por lista de precios
  //   Given que el usuario se encuentra dentro de una caja
  //   When selecciona una lista de precios válida
  //   Then el sistema debe actualizar la grilla de ítems según la lista de precios seleccionada
  //   And los precios mostrados deben corresponder a dicha lista

  await page.getByRole("button", { name: "Continuar vendiendo" }).click(); //
  await page.getByText("Precio estándar (S/)").first().click();
  await page.getByText("Precio dolares ($)").click();
  await page.getByRole("link", { name: "2" }).click();
  await page.getByRole("link", { name: "1" }).click();

  await page.locator(".image-default").first().click();
  await page.getByText("$", { exact: true }).nth(1).click(); // Esto se valida en el carrito que ya mandare la captura de como se ve el simbolo de dolar en el precio del item seleccionado

  // Scenario: Buscar y agregar un producto con control de stock
  //   Given que el usuario se encuentra dentro de una caja
  //   When busca un ítem con control de stock por nombre, código principal o código alternativo
  //   And selecciona el ítem desde la grilla de productos
  //   Then el sistema debe agregar el ítem al carrito
  //   And debe mostrar la descripción del ítem
  //   And debe mostrar la cantidad inicial
  //   And debe mostrar el precio unitario

  await page.getByText("Ventas y compras").click();
  await page.getByText("Ver cajas").click();
  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("111111");
  // Esto es para validar que se muestre la descripcion del item en el carrito
  await page.getByText("Item para combos estricto").click();
  await page.getByText("Item para combos estricto").nth(1).click();
  await page.getByText("S/").nth(5).click(); // Se puede validar leyendo o extrayendo el precio unitario del item seleccionado y validando que se muestre ese mismo precio en el carrito
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad"]',
    )
    .click(); // Esto es el input de la cantidad entonces la cantidad deber ser 1 Se validaria que la cantidad sea 1

  // Scenario: Bloquear agregado de producto con control de stock cuando no tiene disponibilidad
  //   Given que el usuario se encuentra dentro de una caja
  //   When busca un producto con control de stock sin disponibilidad
  //   And intenta agregarlo al carrito
  //   Then el sistema debe bloquear la operación según la lógica configurada
  //   And debe mostrar una validación visible

  await page.getByText("Ventas y compras").click();
  await page.getByText("Ver cajas").click();
  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("111222"); // Al buscar el item se debe captar su Stock para luego intentar agregarlo al carrito de mas de lo que tiene con clicks y validar que se bloquee el agregado por falta de stock
  await page.getByText("Item sin stock estricto").click();
  await page.locator(".image-default").click();
  await page.locator(".image-default").dblclick();
  await page.locator(".image-default").click();
  await page.locator(".image-default").dblclick();
  await page.locator(".image-default").dblclick();
  await page.locator(".image-default").dblclick(); // Estos son los clicks en la iamgen del item para incrementar la cantidad y sobrepasar el stock disponible para validar que se bloquee el agregado y se muestre la validacion de que no hay stock suficiente
  await expect(
    "No puedes agregar este ítem a tu venta sobrepasando el stock disponible",
  );
  await page.getByRole("button", { name: "Aceptar" }).click();

  // Scenario: Agregar un producto con stock flexible
  //   Given que el usuario se encuentra dentro de una caja
  //   When busca un producto con stock flexible
  //   And lo agrega al carrito
  //   Then debe mostrar el ítem en el carrito

  await page.getByText("Ventas y compras").click();
  await page.getByText("Ver cajas").click();
  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("121212");
  await page.getByText("item para combos gravado").click();
  await expect("item para combos gravado"); // esto en el carrito para validar que se agrego el item con stock flexible
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad"]',
    )
    .click();
  await page.getByText("S/").nth(5).click(); // Esto sera un expect en el carrito

  // Scenario: Agregar un producto sin control de stock
  //   Given que el usuario se encuentra dentro de una caja
  //   When busca un producto sin control de stock
  //   And lo agrega al carrito
  //   Then el sistema debe permitir la operación
  //   And debe mostrar el ítem en el carrito

  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.getByText("item gravado sin control").click();
  await page.getByText("S/").nth(5).click();
  await page.getByText("item gravado sin control").nth(1).click();
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedidoópk_cmp-pedido-item:item_v-step:cantidad"]',
    )
    .click();

  // Scenario: Buscar y agregar un servicio
  //   Given que el usuario se encuentra dentro de una caja
  //   When busca un ítem tipo servicio
  //   And lo agrega al carrito
  //   Then el sistema debe mostrar el servicio en el carrito

  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("servicio");
  await page.locator(".image-default").first().click();
  await page.getByText("S/20.00").nth(1).click();
  await page.getByText("Servicio exonerado 4-5-2026_2").nth(1).click(); // esto es un expect pero como tenemos la automatizacion de items lo que se buscara sera la palabra servicio en el carrito para validar que se agrego el servicio correctamente por que eso : exonerado 4-5-2026_2 es un dato que puede variar en la creacoion po rla fecha y tipo de servicio
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad"]').click(); // este es el input de cantidad para validar que se muestre la cantidad inicial que debe ser 1
  await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:totales"]').click();
  await page.locator('.button-close').first().click();

  // Scenario: Buscar y agregar un ítem tipo receta
  //   Given que el usuario se encuentra dentro de una caja
  //   When busca un ítem tipo receta
  //   And lo agrega al carrito
  //   Then el sistema debe mostrar el ítem en el carrito
  //   And debe procesarlo según la lógica definida para recetas
  //   And debe recalcular los importes de la venta

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await expect(page.getByText('0.00', { exact: true })).toBeVisible(); // esto lo usaremos para ver que el monto incial en la venta es 0.00 y luego de agregar el item tipo receta que tiene una logica especial para el calculo de importes se actualice a un monto diferente a 0.00 para validar que se hayan recalculado los importes de la venta al agregar el item tipo receta
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('receta insumos');
  await page.locator('.image-default').first().click();
  await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:totales"]').click(); // Esto es para ver los totales y validar que se hayan recalculado los importes de la venta al agregar el item tipo receta que tiene una logica especial para el calculo de importes

  await page.locator('.button-close > .icon').first().click();

  // Scenario: Buscar y agregar un ítem tipo combo
  //   Given que el usuario se encuentra dentro de una caja
  //   When busca un ítem tipo combo
  //   And lo agrega al carrito
  //   Then el sistema debe mostrar el combo en el carrito
  //   And debe calcular los importes según la lógica del sistema

  
  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
   await expect(page.getByText('0.00', { exact: true })).toBeVisible(); // esto lo usaremos para ver que el monto incial en la venta es 0.00 y luego de agregar el item tipo combo que tiene una logica especial para el calculo de importes se actualice a un monto diferente a 0.00 para validar que se hayan recalculado los importes de la venta al agregar el item tipo combo
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('222222');
  await page.getByText('combo hijo exonegaro item').click();
  await page.getByText('15.00', { exact: true }).click();
  await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:totales"]').click();
  await expect(page.getByText('Operaciones Exoneradas15.00')).toBeVisible();
  await page.locator('.button-close > .icon').first().click();

  // Scenario: Buscar y agregar una lista de productos
  //   Given que el usuario se encuentra dentro de una caja
  //   When busca un ítem tipo lista de productos
  //   And selecciona la lista
  //   Then el sistema debe agregar al carrito todos los productos que componen esa lista
  //   And debe mostrar cada producto agre
  
  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await expect(page.getByText('0.00', { exact: true })).toBeVisible(); // esto lo usaremos para ver que el monto incial en la venta es 0.00 y luego de agregar el item tipo lista de productos que tiene una logica especial para el calculo de importes se actualice a un monto diferente a 0.00 para validar que se hayan recalculado los importes de la venta al agregar el item tipo lista de productos
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('443444');
  await page.getByText('Lista items flexibles 27-4-').click();
  await page.locator('div').filter({ hasText: /^item para combos gravado flexible\(\+S\/10\.00\)$/ }).first().click();
  await page.locator('[id="_div:increase"]').first().click();
  await page.getByRole('button', { name: 'Agregar a venta' }).click();
  await expect(page.getByText('Total4 ítems')).toBeVisible();
  await page.getByText('Operaciones Gravadas58.44').click();
  await page.locator('.button-close > .icon').first().click();

  // Scenario: Buscar y agregar un ítem con variante
  //   Given que el usuario se encuentra dentro de una caja
  //   When busca un ítem con variantes
  //   And selecciona una variante válida
  //   And agrega la variante al carrito
  //   Then el sistema debe mostrar la variante seleccionada en el carrito
  //   And debe mostrar los importes correspondientes


  await page.getByText('caja-autoContinuar vendiendo').click();
  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await expect(page.getByText('0.00', { exact: true })).toBeVisible(); // esto lo usaremos para ver que el monto incial en la venta es 0.00 y luego de agregar el item tipo variante que tiene una logica especial para el calculo de importes se actualice a un monto diferente a 0.00 para validar que se hayan recalculado los importes de la venta al agregar el item tipo variante
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('313131');
  await page.getByText('item con variante flexible').click();
  await page.getByText('Seleccionar').first().click();
  await page.getByText('Acer (1)').click();
  await page.getByText('Variante 2 flexible').click();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await page.getByText('Variante 3 flexible').click();
  await page.locator('.cmp-informacion-item > div').first().click();
  await page.getByText('Total2 ítems').click();
  await expect(page.getByText('Operaciones Gravadas20.90')).toBeVisible(); // Son expect para validar que se muestre la variante seleccionada en el carrito y que se muestren los importes correspondientes luego de agregar un item con variante que tiene una logica especial para el calculo de importes y que se actualicen los importes de la venta al agregar el item con variante
  await page.locator('.button-close > .icon').first().click();
  await expect(page.getByText('24.66')).toBeVisible();
  
  // Scenario: Bloquear agregado de variante sin stock cuando la lógica lo restringe
  //   Given que el usuario se encuentra dentro de una caja
  //   When selecciona una variante sin stock suficiente
  //   And intenta agregarla al carrito
  //   Then el sistema debe bloquear la operación según la lógica configurada
  //   And debe mostrar una validación visible

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('131313');
  await page.getByText('item variante estricto gravado').click();
  await page.locator('[id="pv_punto-venta_cmp-item-variante_cmp-item-variante-grid_v-card:variante-2"] > .v-card-content > .card-wrapper > .card > .left > .imagen > .imagen-default').click(); // deberia de llamar el stock de la variante y segun el stock darle los licks que superen el stock disponible para validar que se bloquee el agregado por falta de stock y se muestre la validacion de que no hay stock suficiente para agregar esa variante al carrito
  await page.locator('div').filter({ hasText: /^8 un$/ }).first().click();
  await page.locator('div:nth-child(2) > .left > .imagen > .imagen-default').click();
  await page.locator('div:nth-child(2) > .left > .imagen > .imagen-default').click();
  await page.locator('div:nth-child(2) > .left > .imagen > .imagen-default').dblclick();
  await page.locator('div:nth-child(2) > .left > .imagen > .imagen-default').click();
  await page.locator('div:nth-child(2) > .left > .imagen > .imagen-default').click();
  await page.locator('div:nth-child(2) > .left > .imagen > .imagen-default').click();
  await page.locator('div:nth-child(2) > .left > .imagen > .imagen-default').click();// Todos estos son click en la imagen del la variante para intentar agregarla al carrito sobrepasando el stock disponible para validar que se bloquee el agregado y se muestre la validacion de que no hay stock suficiente8
  await expect(
    page.getByText(
      "No puedes agregar este ítem a tu venta sobrepasando el stock disponible",
    ),
  ).toBeVisible();// el modal de advertenvia que se supero el stock
  await page.getByRole('button', { name: 'Aceptar' }).click();

  // Scenario: Buscar y agregar un ítem con equivalencia
  //   Given que el usuario se encuentra dentro de una caja
  //   When busca un ítem con equivalencia
  //   And selecciona el ítem
  //   And lo agrega al carrito
  //   Then el sistema debe agregar el ítem correctamente
  //   And debe respetar la lógica de equivalencia definida
  //   And debe recalcular subtotal, IGV y total según la lógica del sistema

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
   await expect(page.getByText('0.00', { exact: true })).toBeVisible(); // esto lo usaremos para ver que el monto incial en la venta es 0.00 y luego de agregar el item tipo equivalente que tiene una logica especial para el calculo de importes se actualice a un monto diferente a 0.00 para validar que se hayan recalculado los importes de la venta al agregar el item tipo equivalente
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('202020');
  await page.getByText('item equivalente flexible').click();
  await page.getByText('Equivalente X2').click();
  await page.locator('.cmp-informacion-item > div').first().click();
  await page.getByText('Total1 ítems').click();
  await expect(page.getByText('Operaciones Gravadas17.04')).toBeVisible();
  await expect(page.getByText('20.11', { exact: true })).toBeVisible();

  // Scenario: Buscar y agregar un ítem con selectores ; Para este test se tendra que crear un item con selector con campos obligatorios ya que ahora no se tienen como campo obligaotorio amenos que modifique un item para este tes y s ya esta activado como vamos a realizar pruebas siemroe del mismo item entonces si esta activado el switch del Obligaotrio ya no se modifica

  // Esto sera el extra:

  await page.getByText('Ventas y comprasProductos y').click();
  await page.getByText('Productos y servicios').click();
  await page.locator('[id="nvg_selects_cmp-header-selects_select:select-module-203-item-2007"]').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('454545');
  await page.locator('.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle').click();
  await page.locator('[id="lgt_items_cmp-grid-options:opciones_items_cmp-dropdown:options-li:edicion-item"]').click();
  await page.getByText('Opciones avanzadas (opcional)').click();
  await page.locator('div').filter({ hasText: /^Selectores\(Opcional\)$/ }).first().click();
  await page.locator('.obligatorio > div > .v-switch > .switch-content > .switch > .slider').click();
  await page.getByRole('button', { name: 'Actualizar producto' }).click();
  await page.locator('.v-modal > div').first().click();
  //   Given que el usuario se encuentra dentro de una caja
  //   When busca un ítem con selectores
  //   And selecciona el ítem
  //   And completa los selectores obligatorios
  //   And confirma la selección
  //   Then el sistema debe agregar el ítem al carrito correctamente
  //   And debe mostrar la configuración seleccionada en el detalle del ítem si aplica

  await page.getByText('Ventas y compras').click();
  await page.getByText('Ver cajas').click();
  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await expect(page.getByText('0.00', { exact: true })).toBeVisible(); // esto lo usaremos para ver que el monto incial en la venta es 0.00 y luego de agregar el item tipo item con selectores que tiene una logica especial para el calculo de importes se actualice a un monto diferente a 0.00 para validar que se hayan recalculado los importes de la venta al agregar el item con selectores
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('454545');
  await page.getByText('item selector gravado').click();
  await page.getByText('(Obligatorio)').click();
  await page.locator('[id="_div:increase"] > .simbolo-mas').first().click();
  await page.getByRole('button', { name: 'Agregar a venta' }).click();

  await page.getByText('Total1 ítems').click();
  await expect(page.getByText('Operaciones Gravadas18.64')).toBeVisible();

  // Scenario: Bloquear agregado de ítem con selectores incompletos
  //   Given que el usuario se encuentra en dentro de una caja
  //   When selecciona un ítem con selectores
  //   And no completa los selectores obligatorios
  //   And intenta confirmar la selección
  //   Then el sistema no debe permitir agregar el ítem al carrito
  //   And debe mostrar una validación visible

  await page.getByText('caja-autoContinuar vendiendo').click();
  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('454545');
  await page.getByText('Psitem selector gravado estricto con item manual454545').click();
  await page.getByRole('button', { name: 'Agregar a venta' }).click();
  await expect(page.getByText('Selector obligatorio')).toBeVisible();

  // Scenario: Bloquear agregado de combo cuando uno de sus componentes no tiene stock
  //   Given que el usuario se encuentra en la pantalla "Caja de venta"
  //   When busca un ítem tipo combo
  //   And selecciona un combo cuyo al menos uno de sus componentes no tiene stock suficiente
  //   And intenta agregarlo al carrito
  //   Then el sistema debe bloquear la operación según la lógica configurada
  //   And debe mostrar una validación visible indicando que uno o más componentes no tienen stock

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('222222');
  await page.getByText('combo hijo exonegaro item').click();
  await page.getByText('combo hijo exonegaro item').first().dblclick();
  await page.locator('.image-default').dblclick();

  // Scenario: Bloquear agregado de receta cuando uno de sus componentes no tiene stock
  //   Given que el usuario se encuentra dentro de una caja
  //   When busca un ítem tipo receta
  //   And selecciona una receta cuyo al menos uno de sus componentes no tiene stock suficiente
  //   And intenta agregarla al carrito
  //   Then el sistema debe bloquear la operación según la lógica configurada
  //   And debe mostrar una validación visible indicando que uno o más componentes no tienen stock
  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.locator('div').filter({ hasText: /^ALMACEN-AUTO$/ }).nth(1).click(); // Nos cambiamos de almacen para tener disponibilidad diferente en los items y que al buscar la receta con item sin stock se pueda validar el bloqueo por falta de stock de uno de sus componentes
  await page.getByText('ALMACÉN DE VENTAS').click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('112121'); // Se creo esta receta para poder cumplir con la receta con un itme sin stock para validar el bloqueo de agregar la receta al carrito por falta de stock de uno de sus componentes y que se muestre la validacion correspondiente de que no se puede agregar la receta por falta de stock de uno de sus componentes
  await page.getByText('Receta con item sin Sotck').click();
  await expect(page.getByText('Receta con item sin Sotck (Item sin stock estricto)')).toBeVisible();	
  await page.getByRole('button', { name: 'Aceptar' }).click();

  // Scenario: Bloquear agregado de lista de productos cuando uno de sus productos no tiene stock
  //   Given que el usuario se encuentra dentro de una caja
  //   When busca un ítem tipo lista de productos
  //   And selecciona una lista en la que al menos uno de los productos no tiene stock suficiente
  //   And intenta agregarla al carrito
  //   Then el sistema debe bloquear la operación según la lógica configurada
  //   And debe mostrar una validación visible indicando que uno o más productos no tienen stock


  await page.locator('[id="cmn_cmp-overload:loading"]').click();
  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.getByText('ALMACEN-AUTO').first().click();
  await page.getByText('ALMACÉN DE VENTAS').click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('434344');//igualmente esto se creo entonces ya existe para validar el bloqueo de agregar la lista de productos al carrito por falta de stock de uno de sus productos y que se muestre la validacion correspondiente de que no se puede agregar la lista de productos por falta de stock de uno de sus productos
  await page.getByText('Lista con un item sin stock').click();
  await expect(page.getByText('No puedes agregar el item a tu venta porque no tienes stock')).toBeVisible();
  await page.getByRole('button', { name: 'Aceptar' }).click();

  // Scenario: Incrementar cantidad de un ítem desde el carrito
  //   Given que el usuario tiene un ítem agregado en el carrito
  //   When incrementa la cantidad con el control disponible
  //   Then el sistema debe actualizar la cantidad del ítem
  //   And debe recalcular subtotal, IGV y total según la lógica del sistema

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();

  await expect(page.getByText('0.00', { exact: true })).toBeVisible(); // antes DE AGREGAR el item al carrito validamos que el monto inicial de la venta sea 0.00 para luego al agregar el item y luego incrementar su cantidad validar que se actualice a un monto diferente a 0.00 para validar que se hayan recalculado los importes de la venta al incrementar la cantidad de un item en el carrito
  await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:totales"]').click();
  await page.getByText('Operaciones Gravadas0.00').click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  await expect(page.getByText('S/10.25')).toBeVisible(); // Este es el precio del item 10.25 entonces le agregaremos 3 mas y el total deberia de actualizarse 
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]').click(); // le dimos click 3 veces al icono plus entonces son en total 4 items entonces el total deberia de ser 10.25 x 4 = 41.00 para validar que se haya actualizado el total al incrementar la cantidad del item en el carrito

  await expect(page.getByText('41.00', { exact: true })).toBeVisible();
  await page.getByText('Total1 ítems').click();
  await expect(page.getByText('Operaciones Gravadas34.75')).toBeVisible();


  //Para este test primero lo agreagaremos desde el carrito tambien y luego lo quitaremos desde el mismo

  // Scenario: Disminuir cantidad de un ítem desde el carrito  
  //   Given que el usuario tiene un ítem agregado en el carrito
  //   When disminuye la cantidad con el control disponible
  //   Then el sistema debe actualizar la cantidad del ítem
  //   And debe recalcular subtotal, IGV y total según la lógica del sistema

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]').dblclick();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]').click(); // Le aumentamos con este plus button como en el paso anterior digo test anterior entonces ahora aqui biene el test es que captemos cuando le damos al minus button para disminuir la cantidad y validamos que se actualice el total de la venta al disminuir la cantidad del item en el carrito

  await expect(page.getByText('71.75', { exact: true })).toBeVisible();// estao actual del total 
  //Ahora bajaremos l cantidad del item a 0

  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:decrement"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:decrement"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:decrement"]').dblclick();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:decrement"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:decrement"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:decrement"]').click();// Le damos bajar la cantidad del item hasta 0 para validar que se actualice el total de la venta al disminuir la cantidad del item en el carrito a 0 y que el item se mantenga en el carrito con cantidad 0 hasta que se elimine manualmente o este color rojo el icono plus
   await page.getByText("Total1 ítems").click();
   await expect(page.getByText("Operaciones Gravadas00.00")).toBeVisible();


    // Scenario: Bloquear cantidad inválida al editar un ítem del carrito
    //   Given que el usuario tiene un ítem agregado en el carrito
    //   When intenta registrar una cantidad inválida
    //   Then el sistema no debe permitir la operación
    //   And debe mostrar una validación visible

    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
    await page.getByText('item gravado sin control').click();
    await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:decrement"]').click();
    await page.getByRole('button', { name: 'PAGAR' }).click();
    await expect(page.getByText('La Cantidad en la lista de ítems no puede ser negativo o cero')).toBeVisible();
    await page.getByRole('button', { name: 'Aceptar' }).click();
    

  // Scenario: Editar el precio unitario de un ítem en el carrito
  //   Given que el usuario tiene un ítem agregado en el carrito
  //   When accede a la edición del ítem
  //   And modifica el precio unitario con un valor válido
  //   And confirma la edición
  //   Then el sistema debe actualizar el precio del ítem
  //   And debe recalcular subtotal, IGV y total según la lógica del sistema

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  await expect(page.getByText('10.25', { exact: true })).toBeVisible();// este es el precion total de un item y el unitario es 10.25 entonces ahora modificaremos el precio unitario a 20 para validar que se actualice el precio total del item a 20 y que se recalculen los importes de la venta al modificar el precio unitario de un item en el carrito
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]').fill('15');
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]').press('ArrowRight');
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]').fill('20');
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]').click();
  await page.getByText('ítems').click();
  await page.getByText('Total1 ítems').click();
  await page.getByText('Operaciones Gravadas16.95').click();
  await page.locator('.button-close').first().click();
  await page.getByText('IGVS/3.05').click();
  await page.getByText('SubtotalS/16.05').click();

  // Scenario: Bloquear edición con precio inválido
  //   Given que el usuario tiene un ítem agregado en el carrito
  //   When accede a la edición del ítem
  //   And ingresa un precio inválido
  //   And intenta confirmar la edición
  //   Then el sistema no debe permitir guardar el cambio
  //   And debe mostrar una validación visible

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]').fill('0.0000.');
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]').click();
  await page.getByRole('button', { name: 'PAGAR' }).click();
  await page.getByText('El valor unitario que se ingresa en la lista de ítems no puede ser negativo ni cero').click();
  await page.getByRole('button', { name: 'Aceptar' }).click();

  // Scenario: Editar el nombre de un producto en el carrito
  //   Given que el usuario tiene un ítem agregado en el carrito
  //   When accede a la edición del ítem
  //   And modifica el nombre del producto
  //   And confirma la edición
  //   Then el sistema debe actualizar el nombre del ítem en el carrito
  //   And debe conservar el resto de la información según la lógica del sistema

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  await expect(page.getByText('10.25', { exact: true })).toBeVisible();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:descripcion"]').fill('Nombre de item editado');
  await expect(page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]')).toBeVisible();
  await page.getByText('Total1 ítems').click();
  await expect(page.getByText('Operaciones Gravadas8.69')).toBeVisible(); // Estos test sera los exoect para validar que los montos se mantengan igual al editar el nombre del item y que solo se actualice el nombre del item en el carrito al editar el nombre del producto de un item en el carrito
  await page.locator('.button-close').first().click();
  await expect(page.getByText('IGVS/ 1.56')).toBeVisible();
  await expect(page.getByText('SubtotalS/8.69')).toBeVisible();

  // Scenario: Eliminar un ítem del carrito
  //   Given que el usuario tiene al menos un ítem agregado en el carrito
  //   When elimina un ítem desde el detalle de la venta
  //   Then el sistema debe quitar el ítem del carrito
  //   And debe recalcular subtotal, IGV y total según la lógica del sistema

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).dblclick();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('121212');
  await page.getByText('item para combos gravado').click();

  await expect(page.getByText('25.77')).toBeVisible();
  await expect(page.getByText('SubtotalS/ 21.84')).toBeVisible();
  await expect(page.getByText("IGVS/ 3.93")).toBeVisible();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-cancelar"]').nth(1).click();// Aqui se esta borrando el primer item que se agrego ya que cada item se va agregando como pila por que el el segundo item es el que queda arriba y el primero abajo entonces al darle click en eliminar el que se elimina es el que esta arriba que es el uñtimo
await expect(page.getByText("SubtotalS/ 13.15")).toBeVisible();
  await page.getByText('IGVS/ 2.37').click();
  await page.getByText('15.52', { exact: true }).click(); // queda el calculo total de el item que queda entonces queda el segundo que ingresmoas de codigo 121212


  // Scenario: Eliminar un ítem con selector del carrito
  //   Given que el usuario tiene un ítem con selectores agregado en el carrito
  //   When elimina el ítem
  //   Then el sistema debe quitarlo del carrito correctamente

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('545454');
  await page.getByText('item selector flexible').click();
  await page.locator('[id="_div:increase"]').first().click();
  await page.getByRole('button', { name: 'Agregar a venta' }).click();
  await page.locator('.deploy-children').click();
  await page.getByText('21.25').click();
  await page.getByText('SubtotalS/ 18.01').click();
  await page.getByText('IGVS/ 3.24').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-cancelar"]').click();
  await expect(page.getByText('0.00', { exact: true })).toBeVisible();

  // Scenario: Limpiar todos los ítems del carrito
  //   Given que el usuario tiene varios ítems agregados en el carrito
  //   When hace clic en "Limpiar carrito"
  //   Then el sistema debe eliminar todos los ítems del carrito
  //   And debe reiniciar los importes de la venta según la lógica del sistema


  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('443444'); // Usaremos una lista qye esa nos trae bastante items y luegolo podemos eliminar
  
  await page.getByText('Lista items flexibles 27-4-').click();
  await page.locator('.v-step.selector').first().click();
  await page.locator('[id="_div:increase"]').first().click();
  await page.getByRole('button', { name: 'Agregar a venta' }).click();
  await page.getByText('Limpiar carrito').click();// Limpia todos los items del carrito
  await expect(page.getByText('0.00', { exact: true })).toBeVisible(); // Validamos que se hayan eliminado todos los items del carrito y que el total de la venta se haya reiniciado a 0.00 luego de limpiar el carrito
  
});