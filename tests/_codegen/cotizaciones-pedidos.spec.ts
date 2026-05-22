import {expect, test} from '@playwright/test';

test('test', async ({ page }) => {
  //Primer caso
  // Scenario: Emitir cotización con cliente registrado
  // Given el usuario selecciona el tipo de comprobante "Cotización"
  // And busca y selecciona un cliente registrado
  // And agrega uno o más productos al carrito
  // And selecciona una validez de oferta
  // And completa los demás datos obligatorios
  // When emite la cotización
  // Then el sistema debe registrar la cotización con estado "Emitido"
  // And debe mostrar el modal con opciones de impresión y descarga de archivos

  await page.goto("https://erpperu2-crt.smartclic.pe/auth/login");
  await page.getByText("Ventas y compras").click();
  await page.getByText("Ver cajas").click();
  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-3007"]',
    )
    .click();
  await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
  await page
    .getByRole("textbox", { name: "Buscar por nombre, razón" })
    .fill("76975258");
  await page
    .getByText(
      "DNIDoc. Nacional de Identidad7697525899999999JHUNIOR BRAYAN GUTIERREZ MAMANIav-",
    )
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.getByText("item gravado sin control").click();
  await expect(page.getByRole("main")).toContainText("Validez de la oferta");
  await page
    .locator("div")
    .filter({ hasText: /^0 días$/ })
    .nth(1)
    .click();
  await page.getByText("15 días").click();
  await expect(page.getByText("días").first()).toBeVisible();
  await page.locator(".collapse-icon").click();
  await expect(page.getByRole("main")).toContainText("Total1 ítemsS/10.25");
  await page.getByRole("button", { name: "PAGAR" }).click();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Enviar por WhatsApp$/ })
      .first(),
  ).toBeVisible();
  await page
    .locator("div")
    .filter({ hasText: /^Enviar por Email$/ })
    .first()
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^Copiar Link$/ })
    .first()
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^Descargar XML$/ })
    .first()
    .click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .locator("div")
    .filter({ hasText: /^Descargar PDF$/ })
    .first()
    .click();
  const download = await downloadPromise;
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Descargar PDF$/ })
      .first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Imprimir", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Imprimir Ticket" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nueva Venta" }).click();
  await page.locator(".icon").first().click();
  await page.getByText("Ventas y compras").click();
  await page
    .locator("div")
    .filter({ hasText: /^Búsqueda de comprobantes$/ })
    .nth(1)
    .click();
  await expect(
    page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("Búsqueda de comprobantes");
  await page.getByRole("button", { name: "Ver filtros avanzados" }).click();
  await page.locator(".vector").first().click();
  await page.getByText("Cotización", { exact: true }).click();
  await page.locator(".vector").first().click();
  await page.getByRole("textbox", { name: "Correlativo" }).click();
  await page.getByRole("textbox", { name: "Correlativo" }).fill("1");
  await page
    .locator(
      '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3252372"]',
    )
    .click();
  await page.getByText("Bitácora").click();
  await expect(page.locator("body")).toContainText(
    "Operacion Satisfactoria - ERP 2",
  );
  await page.getByText("Operacion Satisfactoria - ERP").nth(1).click();
  await expect(page.locator("body")).toContainText(
    "Archivo PDF Generado. - ERP 2",
  );
  await expect(page.locator("body")).toContainText(
    "Operacion Satisfactoria - ERP 2",
  );
  await page.locator(".button-close").first().click();
  await page
    .locator(
      '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3252372"]',
    )
    .click();
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Ver comprobante" }).click();
  const page1 = await page1Promise;
  await expect(
    page1.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("Cotización");
  await page1.getByRole("button", { name: "Salir" }).click();

  // Scenario: Emitir cotización con cliente sin documento
  // Given el usuario selecciona el tipo de comprobante "Cotización"
  // And activa la opción "Cliente sin doc."
  // And agrega nombre y dirección
  // And agrega productos al carrito
  // And completa los demás datos obligatorios
  // When emite la cotización
  // Then el sistema debe registrar la cotización sin requerir DNI o RUC
  await page.locator("body").click();
  await page.goto("https://erpperu2-crt.smartclic.pe/home");
  await page.getByText("Ventas y compras").click();
  await page.getByText("Ver cajas").click();
  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-3007"]',
    )
    .click();
  await expect(page.getByRole("main")).toContainText("Cliente sin doc.");
  await page.locator(".slider").first().click();
  await page.getByRole("textbox", { name: "Nombre/Razón social" }).click();
  await page
    .getByRole("textbox", { name: "Nombre/Razón social" })
    .press("CapsLock");
  await page.getByRole("textbox", { name: "Nombre/Razón social" }).fill("A");
  await page
    .getByRole("textbox", { name: "Nombre/Razón social" })
    .press("CapsLock");
  await page
    .getByRole("textbox", { name: "Nombre/Razón social" })
    .fill("Automatizador qa");
  await page.getByRole("textbox", { name: "Dirección" }).click();
  await page.getByRole("textbox", { name: "Dirección" }).press("CapsLock");
  await page.getByRole("textbox", { name: "Dirección" }).fill("A");
  await page.getByRole("textbox", { name: "Dirección" }).press("CapsLock");
  await page.getByRole("textbox", { name: "Dirección" }).fill("Arequipa");
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.getByText("item gravado sin control").click();
  await page.getByText("días").first().click();
  await page.getByText("20 días").click();
  await page.locator(".collapse-icon").click();
  await expect(page.getByRole("main")).toContainText("Total1 ítemsS/10.56");
  await expect(page.getByRole("main")).toContainText("SubtotalS/ 8.95");
  await expect(page.getByRole("main")).toContainText("IGVS/ 1.61");
  await page.getByRole("button", { name: "PAGAR" }).click();
  await expect(page.locator(".icon.whatsapp")).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Enviar por Email$/ })
      .first(),
  ).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Copiar Link$/ })
      .first(),
  ).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Descargar XML$/ })
      .first(),
  ).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Descargar PDF$/ })
      .first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Imprimir", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Imprimir Ticket" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nueva Venta" }).click();
  await page.locator(".icon").first().click();
  await page.getByText("Ventas y compras").click();
  await page.getByText("Búsqueda de comprobantes").click();
  await page.getByRole("button", { name: "Ver filtros avanzados" }).click();
  await page.getByRole("textbox", { name: "Correlativo" }).click();
  await page.getByRole("textbox", { name: "Correlativo" }).fill("1");
  await page
    .locator(
      '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3252811"]',
    )
    .click();
  await page.getByText("Bitácora").click();
  await expect(page.locator("body")).toContainText(
    "Operacion Satisfactoria - ERP 2",
  );
  await expect(page.locator("body")).toContainText("PDF Generado");
  await page.locator(".drape.is-open > .button-close > .icon").click();
  await page
    .locator(
      '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3252811"]',
    )
    .click();
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Ver comprobante" }).click();
  const page1 = await page1Promise;
  await expect(
    page1.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("Cotización");
  await expect(page1.locator("tbody")).toContainText("151515");
  await page1.getByRole("button", { name: "Salir" }).click();

  // Scenario: Emitir cotización incluyendo imágenes y descripción
  // Given el usuario selecciona el tipo de comprobante "Cotización"
  // And activa la opción "Incluir imágenes"
  // And activa la opción "Incluir descripción"
  // And agrega productos que contienen imágenes y descripción
  // And completa los demás datos obligatorios
  // When emite la cotización
  // Then el sistema debe generar la cotización mostrando imágenes y descripción de productos   // Para este tes se hara primero que se verifique si el item tiene un imagen entonces

  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-3007"]',
    )
    .click();
  await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
  await page
    .getByRole("textbox", { name: "Buscar por nombre, razón" })
    .fill("76958585");
  await page
    .getByText(
      "DNIDoc. Nacional de Identidad7695858599999999MARCELO EDWIN SOLANO GARAYArequipa",
    )
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await expect(
    page.getByRole("img", { name: "item gravado sin control" }),
  ).toBeVisible();
  await page.getByText("item gravado sin control").click();
  await page
    .locator(
      ".switch-group > div > .switch-component > .v-switch > .switch-content > .switch > .slider",
    )
    .first()
    .click();
  await page
    .locator(
      "div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider",
    )
    .click();
  await page.getByRole("button", { name: "VISTA PREVIA" }).click();
  await page.getByRole("button", { name: "VISTA PREVIA" }).click(); // aqui validaremos la imagen y la descripcion del item ojo que la vista previa creo un
  await expect(page.locator("body")).toContainText(
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  );

  await page.getByRole("button", { name: "VISTA PREVIA" }).click();
  await expect(
    page
      .getByRole("row", {
        name: "item gravado sin control Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        exact: true,
      })
      .getByRole("img"),
  ).toBeVisible();
  await page.locator(".icon-close").click();
  await page.locator(".collapse-icon").click();
  await expect(page.getByRole("main")).toContainText("Total1 ítemsS/10.56");
  await expect(page.getByRole("main")).toContainText("IGVS/ 1.61");
  await expect(page.getByRole("main")).toContainText("SubtotalS/ 8.95");
  await page.getByRole("button", { name: "PAGAR" }).click();
  await page.getByRole("button", { name: "Nueva Venta" }).click();
  await page.locator(".icon").first().click();
  await page.getByText("Ventas y compras").click();
  await page.getByText("Búsqueda de comprobantes").click();
  await page.getByRole("button", { name: "Ver filtros avanzados" }).click();
  await page.getByRole("textbox", { name: "Correlativo" }).click();
  await page.getByRole("textbox", { name: "Correlativo" }).fill("2");
  await page
    .locator(
      '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3252830"]',
    )
    .click();
  await page.getByText("Bitácora").click();
  await page.locator(".drape.is-open > .button-close").click();
  await page
    .locator(
      '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3252830"]',
    )
    .click();
  const page2Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Ver comprobante" }).click();
  const page2 = await page2Promise;
  await expect(
    page2.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("Cotización"); // Dato adicional: ¡Perfecto! Al analizar el código HTML que compartes, hay un detalle técnico muy importante y súper interesante: tu frontend está convirtiendo la ruta de la imagen a Base64 antes de dibujarla en el HTML.Si te fijas bien:// El API te devuelve: "55555566666/PRODUCTOS/72063-72063-.jpg"// El HTML dibuja: src=".../archivos/NTU1NTU1NjY2NjYvUFJPRFVDVE9TLzcyMDYzLTcyMDYzLS5qcGc%3D" Asi podemos integrarlo : import { test, expect } from '@playwright/test'; Comovez abajo podriamos integrarlo asi esta prubeba

//   test("Validar imagen Base64 y detalles en el HTML de la cotización", async ({
//     page,
//   }) => {
//     // 1. Asumimos que aquí ya capturaste tu JSON del API (como vimos en el paso anterior)
//     const datosItem = {
//       DescripcionItem: "item gravado sin control",
//       UrlImagen: "55555566666/PRODUCTOS/72063-72063-.jpg",
//       Detalle:
//         "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
//     };

//     // 2. CONVERSIÓN CLAVE: Transformar la ruta del API a Base64 y formato URL
//     // Esto simula lo que hace tu frontend para poder buscarlo correctamente en el DOM
//     const imagenBase64 = Buffer.from(datosItem.UrlImagen).toString("base64");
//     const urlImagenFrontend = encodeURIComponent(imagenBase64); // Convierte el '=' en '%3D'

//     // 3. Localizar el contenedor principal de los items (tu tabla)
//     // Ubicamos la fila (tr) que contenga la descripción de nuestro item
//     const filaItem = page
//       .locator("table.grid tbody tr")
//       .filter({ hasText: datosItem.DescripcionItem });

//     // --- VALIDACIONES VISUALES (DOM) ---

//     // A. Validar que la descripción principal (nombre) se renderiza
//     await expect(filaItem).toContainText(datosItem.DescripcionItem);

//     // B. Validar que el detalle extenso (Lorem Ipsum) se dibuja dentro de la fila
//     await expect(filaItem).toContainText(datosItem.Detalle);

//     // C. Validar que la imagen existe y su 'src' contiene el Base64 correcto
//     const imagenElement = filaItem.locator(`img[src*="${urlImagenFrontend}"]`);
//     await expect(imagenElement).toBeVisible();
//   });

  // Scenario: Emitir cotización con validez de oferta de varios días
  // Given el usuario selecciona el tipo de comprobante "Cotización"
  // And agrega productos al carrito
  // And selecciona una opción distinta de vigencia en "Validez de la oferta"
  // And completa los demás datos obligatorios
  // When emite la cotización
  // Then el sistema debe mostrar la cantidad de días seleccionada en la cotización generada

  await page.getByText('Ventas y compras').click();
  await page.getByText('Ver cajas').click();
  await page.getByText('caja-autoContinuar vendiendo').click();
  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
  await page.getByText('COTIZACIÓN').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).fill('76958585');
  await page.getByText('DNIDoc. Nacional de Identidad7695858599999999MARCELO EDWIN SOLANO GARAYArequipa').click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  await page.locator('div').filter({ hasText: /^0 días$/ }).nth(1).click();
  await page.getByText('40 días').click();
  await page.getByRole('button', { name: 'PAGAR' }).click();
  await expect(page.locator('body')).toContainText('Enviar por WhatsApp');
  await expect(page.locator('body')).toContainText('Descargar PDF');
  await expect(page.locator('body')).toContainText('Imprimir');
  await expect(page.locator('body')).toContainText('Imprimir Ticket');
  await expect(page.getByText('Tu comprobante fue emitido')).toBeVisible();
  await page.getByRole('button', { name: 'Nueva Venta' }).click();
  await page.locator('.icon').first().click();
  await page.getByText('Ventas y compras').click();
  await page.getByText('Búsqueda de comprobantes').click();
  await page.locator('[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-COTIZACIONES"]').click();
  await page.getByRole('button', { name: 'Ver filtros avanzados' }).click();
  await page.getByRole('textbox', { name: 'Correlativo' }).click();
  await page.getByRole('textbox', { name: 'Correlativo' }).fill('3');
  await expect(page.locator('tbody')).toContainText('40 días');
  await expect(page.getByText('Validez oferta')).toBeVisible();
  await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3252896"]').click();
  await page.getByText('Bitácora').click();
  await page.locator('.button-close').first().click();
  await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3252896"]').click();
  const page3Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Ver comprobante' }).click();
  const page3 = await page3Promise;
  await expect(page3.getByText('Cotización')).toBeVisible();
  await expect(page3.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]')).toContainText('Validez de la oferta40 días');
  await page3.getByRole('button', { name: 'Salir' }).click();

  // Scenario: Validar emisión de cotización sin productos
  // Given el usuario selecciona el tipo de comprobante "Cotización"
  // And no agrega productos al carrito
  // When intenta emitir la cotización
  // Then el sistema debe impedir la emisión
  // And debe mostrar un mensaje indicando que debe agregar al menos un producto
  
  await page.getByText('Ventas y compras').click();
  await page.getByText('Ver cajas').click();
  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.getByText('BOLETA').first().click();
  await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-3007"]').click();
  await page.getByRole('button', { name: 'PAGAR' }).click();
  await expect(page.locator('body')).toContainText('No puedes realizar un pago porque no tienes ítems seleccionados');
  await page.getByRole('button', { name: 'Aceptar' }).click();

  // Scenario: Emitir cotización con productos sin stock
  // Given el usuario selecciona el tipo de comprobante "Cotización"
  // And busca productos que no cuentan con stock disponible
  // And el sistema permite seleccionar los productos sin restricción
  // And agrega los productos al carrito
  // When emite la cotización
  // Then el sistema debe generar la cotización correctamente
  // And no debe realizar descarga de stock de los productos cotizados


  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.getByText('BOLETA').first().click();
  await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-3007"]').click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('111222');
  await page.locator('.image').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"] > .simbolo-mas').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]').dblclick();
  await page.locator('[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]').click();
  await page.getByRole('button', { name: 'PAGAR' }).click();
  await expect(page.locator('div').filter({ hasText: /^Enviar por WhatsApp$/ }).first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Descargar PDF$/ }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Imprimir', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Imprimir Ticket' })).toBeVisible();
  await page.getByRole('button', { name: 'Nueva Venta' }).click();
  //
  // =========================================================
  // PEDIDOS
  // =========================================================
  //
  // Scenario: Registrar pedido con cliente registrado
  // Given el usuario selecciona "Pedido"
  // And completa la fecha de emisión pasada
  // And busca y selecciona un cliente registrado
  // And agrega uno o más productos al carrito
  // When registra el pedido
  // Then el sistema debe guardar el pedido correctamente
  // And debe generar un código correlativo único de pedido
  // And debe mostrar el modal con opciones de compartir, descargar, imprimir e iniciar nueva venta
  
  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
  await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]').click();
  await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-input:fecha"]').click();
  await page.getByRole('button', { name: 'viernes, 1 de may de' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).fill('76958585');
  await page.getByText('DNIDoc. Nacional de Identidad7695858599999999MARCELO EDWIN SOLANO GARAYArequipa').click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('');
  await page.getByRole('button', { name: 'GUARDAR PEDIDO' }).click();
  await expect(page.locator('div').filter({ hasText: /^Enviar por WhatsApp$/ }).first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Enviar por Email$/ }).first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Copiar Link$/ }).first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Descargar XML$/ }).first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Descargar PDF$/ }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Imprimir', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Imprimir Ticket' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nueva Venta' })).toBeVisible();
  
  
  // Scenario: Registrar pedido con cliente sin documento
  // Given el usuario selecciona "Pedido"
  // And selecciona una serie activa
  // And completa la fecha de emisión actual
  // And activa la opción "Cliente sin doc."
  // And ingresa el nombre del cliente
  // And agrega productos al carrito
  // When registra el pedido
  // Then el sistema debe guardar el pedido sin requerir DNI o RUC
  // And debe generar un código correlativo único de pedido
  

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
  await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]').click();
  await page.locator('div').filter({ hasText: /^PD01$/ }).nth(1).click();
  await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:serie_v-option:opcion-273834"]').getByText('PD01').click();
  await page.getByText('22/05/').click();
  await page.getByRole('button', { name: 'viernes, 22 de may de' }).click();// Esto sera siemre la fecha actual entonces tenemos uqe seleccionar el dia que se hcae la prueba

  await page.locator('.slider').click();
  await page.getByRole('textbox', { name: 'Nombre/Razón social' }).click();
  await page.getByRole('textbox', { name: 'Nombre/Razón social' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Nombre/Razón social' }).fill('A');
  await page.getByRole('textbox', { name: 'Nombre/Razón social' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Nombre/Razón social' }).fill('Automatizador qa');
  await page.locator('div:nth-child(3) > .v-input > .v-input-small > .v-input-small-base > .v-input-small-base-container').click();
  await page.getByRole('textbox', { name: 'Dirección' }).fill('Arequipa');
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
  await page.locator('[id="cmn_cmp-overload:loading"]').click();
  await page.getByText('item gravado sin control').click();
  await page.getByRole('button', { name: 'GUARDAR PEDIDO' }).click();
  await expect(page.locator('[id="pv_punto-venta_post-emision_v-button:imprimir-voucher"]')).toContainText('Imprimir Ticket');
  await page.getByRole('button', { name: 'Nueva Venta' }).click();


  // Scenario: Registrar pedido con productos sin stock
  // Given el usuario selecciona "Pedido"
  // And busca productos que no cuentan con stock disponible
  // And el sistema permite seleccionar los productos sin restricción
  // And agrega los productos al carrito
  // When registra el pedido
  // Then el sistema debe guardar el pedido correctamente
  // And no debe realizar descarga de stock de los productos registrados
  
  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.locator('.datos').first().click();
  await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
  await page.getByText('PEDIDO').click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('111222');
  await page.getByText('Item sin stock estricto').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]').dblclick();
  await page.locator('.v-step.grid').click();
  await page.getByRole('button', { name: 'GUARDAR PEDIDO' }).click(); // Al momento de guragar pedido se consulta  ala pai de kardex por este item 111222 de mantener 0 el desceuntos de 
  await page.getByRole('button', { name: 'Nueva Venta' }).click();

  // Scenario: Validar que el pedido no afecta inventario
  // Given el usuario selecciona el tipo de operación "Pedido"
  // And agrega productos al carrito
  // When registra el pedido
  // Then el sistema debe guardar el pedido correctamente
  // And no debe generar movimientos de salida de inventario
  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.locator('.datos').first().click();
  await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
  await page.getByText('PEDIDO').click();
  
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('121212');
  await page.getByText('item para combos gravado flexible').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]').click();
  await page.locator('[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]').dblclick();
  await page.locator('.v-step.grid').click();
  await page.getByRole('button', { name: 'GUARDAR PEDIDO' }).click(); // Al momento de guragar pedido se consulta  ala pai de kardex por este item 121212 de mantener 0 el desceuntos de 
  await page.getByRole('button', { name: 'Nueva Venta' }).click();
  
  // Scenario: Validar que el pedido no genera comprobante electrónico
  // Given el usuario completa los datos obligatorios del pedido
  // And agrega productos al carrito
  // When registra el pedido
  // Then el sistema debe guardar el pedido como documento interno
  // And no debe generar XML
  // And no debe generar CDR

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.getByText('BOLETA').first().click();
  await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]').click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).fill('76958585');
  await page.getByText('DNIDoc. Nacional de Identidad7695858599999999MARCELO EDWIN SOLANO GARAYArequipa').click();
  await page.locator('.collapse-icon').click();
  await expect(page.getByRole('main')).toContainText('Total1 ítemsS/10.56');
  await page.getByRole('button', { name: 'GUARDAR PEDIDO' }).click();
  await expect(page.locator('body')).toContainText('Enviar por WhatsApp');
  await expect(page.locator('body')).toContainText('Enviar por Email');
  await page.locator('div').filter({ hasText: /^Descargar XML$/ }).first().click();
  await expect(page.locator('body')).toContainText('Este tipo de comprobante no genera XML');
  await page.getByRole('button', { name: 'Nueva Venta' }).click();
  await page.locator('.icon').first().click();
  await page.getByText('Ventas y compras').click();
  await page.getByText('Búsqueda de comprobantes').click();
  await page.locator('[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-PEDIDOS"]').click();
  await page.getByRole('button', { name: 'Ver filtros avanzados' }).click();
  await page.getByRole('textbox', { name: 'Correlativo' }).click();
  await page.getByRole('textbox', { name: 'Correlativo' }).fill('4');
  await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3252911"]').click();
  await page.getByText('Bitácora').click();
  await expect(page.locator('body')).toContainText('Comprobante Registrado');
  await expect(page.locator('body')).toContainText('Comprobante Emitido');
  await page.locator('.drape.is-open > .button-close').click();
  await page.getByRole('button', { name: 'Borrar filtros' }).click(); // Solo deben de haver estos eventos del cimoriabtne en bitacora 

  // Scenario: Validar acciones disponibles después de registrar pedido
  // Given el usuario completa los datos obligatorios del pedido
  // And agrega productos al carrito
  // When registra el pedido
  // Then el sistema debe mostrar el modal de registro correcto
  // And debe mostrar el número de pedido generado
  // And debe mostrar opciones para compartir, descargar, imprimir e iniciar nueva venta


  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
  await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]').click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
  await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).fill('76958585');
  await page.getByText('DNIDoc. Nacional de Identidad7695858599999999MARCELO EDWIN SOLANO GARAYArequipa').click();
  await page.getByRole('button', { name: 'GUARDAR PEDIDO' }).click();
  await expect(page.getByText('¡Buen trabajo!')).toBeVisible();
  await expect(page.getByText('Tu comprobante fue emitido')).toBeVisible();
  await expect(page.locator('body')).toContainText('PD01-00000005');// Ese Correlativo tiene que se una variable porque son varias ceves que se ejceutara y siemrpre cambiara
  await expect(page.locator('div').filter({ hasText: /^Enviar por WhatsApp$/ }).first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Enviar por Email$/ }).first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Copiar Link$/ }).first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Descargar XML$/ }).first()).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Descargar PDF$/ }).first()).toBeVisible();
  await expect(page.locator('[id="pv_punto-venta_post-emision_v-button:imprimir-a4"]')).toContainText('Imprimir');
  await expect(page.locator('[id="pv_punto-venta_post-emision_v-button:imprimir-voucher"]')).toContainText('Imprimir Ticket');
  await expect(page.getByRole('button', { name: 'Nueva Venta' })).toBeVisible();
  await page.getByRole('button', { name: 'Nueva Venta' }).click();

  // Scenario: Compartir pedido registrado
  // Given el pedido fue registrado correctamente
  // And el sistema muestra el modal de acciones
  // When el usuario selecciona una opción de compartir
  // Then el sistema debe permitir compartir el pedido por WhatsApp, Email o copiar enlace

  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
  await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]').click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  await page.getByRole('button', { name: 'GUARDAR PEDIDO' }).click();
  await expect(page.locator('.icon.link')).toBeVisible();
  await page.locator('.icon.link').click();
  await expect(page.locator('body')).toContainText('Enviar por Email');
  await page.getByText('Enviar por Email').click();
  await page.getByRole('textbox', { name: 'Ej. email@gmail.com, email2@' }).click();
  await page.getByRole('textbox', { name: 'Ej. email@gmail.com, email2@' }).fill('srqapruebaserp2@gmail.com');

  await page.getByText('Enviar', { exact: true }).click();
  await expect(page.locator('body')).toContainText('¡Mail enviado!');
  await page.getByRole('button', { name: 'Nueva Venta' }).click();

  // Scenario: Descargar pedido registrado
  // Given el pedido fue registrado correctamente
  // And el sistema muestra el modal de acciones
  // When el usuario selecciona una opción de descarga
  // Then el sistema debe permitir descargar el documento del pedido
  
  await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
  
  await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
  await page.getByText('PEDIDO').click();
  await page.locator('div').filter({ hasText: 'AlmacénALMACEN-AUTOALMACEN-' }).nth(3).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
  await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
  await page.getByText('item gravado sin control').click();
  await page.getByRole('button', { name: 'GUARDAR PEDIDO' }).click();
  await page.locator('div').filter({ hasText: /^Descargar PDF$/ }).first().click()
  await page.getByRole('button', { name: 'Nueva Venta' }).click();
  
 
  // Scenario: Imprimir pedido registrado
  // Given el pedido fue registrado correctamente
  // And el sistema muestra el modal de acciones
  // When el usuario selecciona una opción de impresión
  // Then el sistema debe permitir imprimir el pedido en formato estándar o ticket

  
  // Scenario: Buscar pedido existente por código desde el campo correlativo
  // Given existen pedidos registrados previamente
  // And el usuario selecciona "Pedido"
  // And selecciona la serie del pedido
  // And ingresa el número de pedido en el campo correlativo
  // When realiza la búsqueda del pedido
  // Then el sistema debe mostrar el pedido encontrado
  // And debe cargar la información del pedido en pantalla
  //
  // Scenario: Listar todos los pedidos desde la opción "Ver todos"
  // Given existen pedidos registrados previamente
  // And el usuario selecciona "Pedido"
  // When selecciona la opción "Ver todos"
  // Then el sistema debe mostrar la lista de pedidos de la sucursal
  // And debe permitir filtrar por "N° de pedido", "Cliente", "Caja" o "Tienda Virtual"
  //
  // Scenario: Buscar pedido por número desde la lista de pedidos
  // Given el usuario visualiza la lista de pedidos
  // And selecciona el filtro "N° de pedido"
  // When ingresa el número de pedido
  // Then el sistema debe mostrar los pedidos coincidentes con la búsqueda
  //
  // Scenario: Buscar pedido por cliente desde la lista de pedidos
  // Given el usuario visualiza la lista de pedidos
  // And selecciona el filtro "Cliente"
  // When ingresa el nombre o documento del cliente
  // Then el sistema debe mostrar los pedidos coincidentes con el cliente buscado
  //
  // Scenario: Buscar pedido por caja desde la lista de pedidos
  // Given el usuario visualiza la lista de pedidos
  // And selecciona el filtro "Caja"
  // When ingresa o selecciona una caja
  // Then el sistema debe mostrar los pedidos asociados a la caja seleccionada
  //
  // Scenario: Ver pedido desde la lista de pedidos
  // Given el usuario visualiza la lista de pedidos
  // And existen pedidos disponibles en la lista
  // When selecciona la opción "Ver pedido" de un pedido
  // Then el sistema debe mostrar el detalle del pedido seleccionado
  // And no debe modificar el formulario actual
  //
  // Scenario: Cargar pedido desde la lista de pedidos
  // Given el usuario visualiza la lista de pedidos
  // And existen pedidos disponibles en la lista
  // When selecciona la opción "Cargar pedido" de un pedido
  // Then el sistema debe cerrar la lista de pedidos
  // And debe cargar en pantalla los datos del pedido seleccionado
  // And debe cargar cliente, productos, cantidades y datos registrados
  //
  // Scenario: Actualizar pedido cargado
  // Given el usuario carga un pedido existente
  // And modifica información del cliente o productos registrados
  // When guarda los cambios del pedido
  // Then el sistema debe actualizar la información del pedido correctamente
  // And debe conservar el mismo código de pedido
};