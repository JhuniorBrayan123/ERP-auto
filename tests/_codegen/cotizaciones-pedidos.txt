import { expect, test } from "@playwright/test";

test("test", async ({ page }) => {
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

  await page.getByText("Ventas y compras").click();
  await page.getByText("Ver cajas").click();
  await page.getByText("caja-autoContinuar vendiendo").click();
  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page.getByText("COTIZACIÓN").click();
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
  await page.getByText("item gravado sin control").click();
  await page
    .locator("div")
    .filter({ hasText: /^0 días$/ })
    .nth(1)
    .click();
  await page.getByText("40 días").click();
  await page.getByRole("button", { name: "PAGAR" }).click();
  await expect(page.locator("body")).toContainText("Enviar por WhatsApp");
  await expect(page.locator("body")).toContainText("Descargar PDF");
  await expect(page.locator("body")).toContainText("Imprimir");
  await expect(page.locator("body")).toContainText("Imprimir Ticket");
  await expect(page.getByText("Tu comprobante fue emitido")).toBeVisible();
  await page.getByRole("button", { name: "Nueva Venta" }).click();
  await page.locator(".icon").first().click();
  await page.getByText("Ventas y compras").click();
  await page.getByText("Búsqueda de comprobantes").click();
  await page
    .locator(
      '[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-COTIZACIONES"]',
    )
    .click();
  await page.getByRole("button", { name: "Ver filtros avanzados" }).click();
  await page.getByRole("textbox", { name: "Correlativo" }).click();
  await page.getByRole("textbox", { name: "Correlativo" }).fill("3");
  await expect(page.locator("tbody")).toContainText("40 días");
  await expect(page.getByText("Validez oferta")).toBeVisible();
  await page
    .locator(
      '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3252896"]',
    )
    .click();
  await page.getByText("Bitácora").click();
  await page.locator(".button-close").first().click();
  await page
    .locator(
      '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3252896"]',
    )
    .click();
  const page3Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Ver comprobante" }).click();
  const page3 = await page3Promise;
  await expect(page3.getByText("Cotización")).toBeVisible();
  await expect(
    page3.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("Validez de la oferta40 días");
  await page3.getByRole("button", { name: "Salir" }).click();

  // Scenario: Validar emisión de cotización sin productos
  // Given el usuario selecciona el tipo de comprobante "Cotización"
  // And no agrega productos al carrito
  // When intenta emitir la cotización
  // Then el sistema debe impedir la emisión
  // And debe mostrar un mensaje indicando que debe agregar al menos un producto

  await page.getByText("Ventas y compras").click();
  await page.getByText("Ver cajas").click();
  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page.getByText("BOLETA").first().click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-3007"]',
    )
    .click();
  await page.getByRole("button", { name: "PAGAR" }).click();
  await expect(page.locator("body")).toContainText(
    "No puedes realizar un pago porque no tienes ítems seleccionados",
  );
  await page.getByRole("button", { name: "Aceptar" }).click();

  // Scenario: Emitir cotización con productos sin stock
  // Given el usuario selecciona el tipo de comprobante "Cotización"
  // And busca productos que no cuentan con stock disponible
  // And el sistema permite seleccionar los productos sin restricción
  // And agrega los productos al carrito
  // When emite la cotización
  // Then el sistema debe generar la cotización correctamente
  // And no debe realizar descarga de stock de los productos cotizados

  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page.getByText("BOLETA").first().click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-3007"]',
    )
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("111222");
  await page.locator(".image").click();
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"] > .simbolo-mas',
    )
    .click();
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
    )
    .dblclick();
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
    )
    .click();
  await page.getByRole("button", { name: "PAGAR" }).click();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Enviar por WhatsApp$/ })
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

  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-input:fecha"]',
    )
    .click();
  await page.getByRole("button", { name: "viernes, 1 de may de" }).click();
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
  await page.getByText("item gravado sin control").click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("");
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Enviar por WhatsApp$/ })
      .first(),
  ).toBeVisible();
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
  await expect(page.getByRole("button", { name: "Nueva Venta" })).toBeVisible();

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

  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^PD01$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:serie_v-option:opcion-273834"]',
    )
    .getByText("PD01")
    .click();
  await page.getByText("22/05/").click();
  await page.getByRole("button", { name: "viernes, 22 de may de" }).click(); // Esto sera siemre la fecha actual entonces tenemos uqe seleccionar el dia que se hcae la prueba

  await page.locator(".slider").click();
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
  await page
    .locator(
      "div:nth-child(3) > .v-input > .v-input-small > .v-input-small-base > .v-input-small-base-container",
    )
    .click();
  await page.getByRole("textbox", { name: "Dirección" }).fill("Arequipa");
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.locator('[id="cmn_cmp-overload:loading"]').click();
  await page.getByText("item gravado sin control").click();
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click();
  await expect(
    page.locator(
      '[id="pv_punto-venta_post-emision_v-button:imprimir-voucher"]',
    ),
  ).toContainText("Imprimir Ticket");
  await page.getByRole("button", { name: "Nueva Venta" }).click();

  // Scenario: Registrar pedido con productos sin stock
  // Given el usuario selecciona "Pedido"
  // And busca productos que no cuentan con stock disponible
  // And el sistema permite seleccionar los productos sin restricción
  // And agrega los productos al carrito
  // When registra el pedido
  // Then el sistema debe guardar el pedido correctamente
  // And no debe realizar descarga de stock de los productos registrados

  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page.locator(".datos").first().click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page.getByText("PEDIDO").click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("111222");
  await page.getByText("Item sin stock estricto").click();
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
    )
    .dblclick();
  await page.locator(".v-step.grid").click();
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click(); // Al momento de guragar pedido se consulta  ala pai de kardex por este item 111222 de mantener 0 el desceuntos de
  await page.getByRole("button", { name: "Nueva Venta" }).click();

  // Scenario: Validar que el pedido no afecta inventario
  // Given el usuario selecciona el tipo de operación "Pedido"
  // And agrega productos al carrito
  // When registra el pedido
  // Then el sistema debe guardar el pedido correctamente
  // And no debe generar movimientos de salida de inventario
  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page.locator(".datos").first().click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page.getByText("PEDIDO").click();

  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("121212");
  await page.getByText("item para combos gravado flexible").click();
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
    )
    .dblclick();
  await page.locator(".v-step.grid").click();
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click(); // Al momento de guragar pedido se consulta  ala pai de kardex por este item 121212 de mantener 0 el desceuntos de
  await page.getByRole("button", { name: "Nueva Venta" }).click();

  // Scenario: Validar que el pedido no genera comprobante electrónico
  // Given el usuario completa los datos obligatorios del pedido
  // And agrega productos al carrito
  // When registra el pedido
  // Then el sistema debe guardar el pedido como documento interno
  // And no debe generar XML
  // And no debe generar CDR

  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page.getByText("BOLETA").first().click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.getByText("item gravado sin control").click();
  await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
  await page
    .getByRole("textbox", { name: "Buscar por nombre, razón" })
    .fill("76958585");
  await page
    .getByText(
      "DNIDoc. Nacional de Identidad7695858599999999MARCELO EDWIN SOLANO GARAYArequipa",
    )
    .click();
  await page.locator(".collapse-icon").click();
  await expect(page.getByRole("main")).toContainText("Total1 ítemsS/10.56");
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click();
  await expect(page.locator("body")).toContainText("Enviar por WhatsApp");
  await expect(page.locator("body")).toContainText("Enviar por Email");
  await page
    .locator("div")
    .filter({ hasText: /^Descargar XML$/ })
    .first()
    .click();
  await expect(page.locator("body")).toContainText(
    "Este tipo de comprobante no genera XML",
  );
  await page.getByRole("button", { name: "Nueva Venta" }).click();
  await page.locator(".icon").first().click();
  await page.getByText("Ventas y compras").click();
  await page.getByText("Búsqueda de comprobantes").click();
  await page
    .locator(
      '[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-PEDIDOS"]',
    )
    .click();
  await page.getByRole("button", { name: "Ver filtros avanzados" }).click();
  await page.getByRole("textbox", { name: "Correlativo" }).click();
  await page.getByRole("textbox", { name: "Correlativo" }).fill("4");
  await page
    .locator(
      '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3252911"]',
    )
    .click();
  await page.getByText("Bitácora").click();
  await expect(page.locator("body")).toContainText("Comprobante Registrado");
  await expect(page.locator("body")).toContainText("Comprobante Emitido");
  await page.locator(".drape.is-open > .button-close").click();
  await page.getByRole("button", { name: "Borrar filtros" }).click(); // Solo deben de haver estos eventos del cimoriabtne en bitacora

  // Scenario: Validar acciones disponibles después de registrar pedido
  // Given el usuario completa los datos obligatorios del pedido
  // And agrega productos al carrito
  // When registra el pedido
  // Then el sistema debe mostrar el modal de registro correcto
  // And debe mostrar el número de pedido generado
  // And debe mostrar opciones para compartir, descargar, imprimir e iniciar nueva venta

  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.getByText("item gravado sin control").click();
  await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
  await page
    .getByRole("textbox", { name: "Buscar por nombre, razón" })
    .fill("76958585");
  await page
    .getByText(
      "DNIDoc. Nacional de Identidad7695858599999999MARCELO EDWIN SOLANO GARAYArequipa",
    )
    .click();
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click();
  await expect(page.getByText("¡Buen trabajo!")).toBeVisible();
  await expect(page.getByText("Tu comprobante fue emitido")).toBeVisible();
  await expect(page.locator("body")).toContainText("PD01-00000005"); // Ese Correlativo tiene que se una variable porque son varias ceves que se ejceutara y siemrpre cambiara
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Enviar por WhatsApp$/ })
      .first(),
  ).toBeVisible();
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
    page.locator('[id="pv_punto-venta_post-emision_v-button:imprimir-a4"]'),
  ).toContainText("Imprimir");
  await expect(
    page.locator(
      '[id="pv_punto-venta_post-emision_v-button:imprimir-voucher"]',
    ),
  ).toContainText("Imprimir Ticket");
  await expect(page.getByRole("button", { name: "Nueva Venta" })).toBeVisible();
  await page.getByRole("button", { name: "Nueva Venta" }).click();

  // Scenario: Compartir pedido registrado
  // Given el pedido fue registrado correctamente
  // And el sistema muestra el modal de acciones
  // When el usuario selecciona una opción de compartir
  // Then el sistema debe permitir compartir el pedido por WhatsApp, Email o copiar enlace

  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.getByText("item gravado sin control").click();
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click();
  await expect(page.locator(".icon.link")).toBeVisible();
  await page.locator(".icon.link").click();
  await expect(page.locator("body")).toContainText("Enviar por Email");
  await page.getByText("Enviar por Email").click();
  await page
    .getByRole("textbox", { name: "Ej. email@gmail.com, email2@" })
    .click();
  await page
    .getByRole("textbox", { name: "Ej. email@gmail.com, email2@" })
    .fill("srqapruebaserp2@gmail.com");

  await page.getByText("Enviar", { exact: true }).click();
  await expect(page.locator("body")).toContainText("¡Mail enviado!");
  await page.getByRole("button", { name: "Nueva Venta" }).click();

  // Scenario: Descargar pedido registrado
  // Given el pedido fue registrado correctamente
  // And el sistema muestra el modal de acciones
  // When el usuario selecciona una opción de descarga
  // Then el sistema debe permitir descargar el documento del pedido

  await page.getByRole("button", { name: "Continuar vendiendo" }).click();

  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page.getByText("PEDIDO").click();
  await page
    .locator("div")
    .filter({ hasText: "AlmacénALMACEN-AUTOALMACEN-" })
    .nth(3)
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.getByText("item gravado sin control").click();
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Descargar PDF$/ })
    .first()
    .click();
  await page.getByRole("button", { name: "Nueva Venta" }).click();

  // Scenario: Imprimir pedido registrado
  // Given el pedido fue registrado correctamente
  // And el sistema muestra el modal de acciones
  // When el usuario selecciona una opción de impresión
  // Then el sistema debe permitir imprimir el pedido en formato estándar o ticket
  await page.goto("https://erpperu2-crt-4.smartclic.pe/home");
  await page.getByText("Ventas y compras").click();
  await page.getByText("Ver cajas").click();
  await page.goto("https://erpperu2-crt-4.smartclic.pe/punto-venta/cajas");
  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.getByText("item gravado sin control").click();
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click();
  await expect(page.locator("body")).toContainText("Imprimir");
  await expect(
    page.getByRole("button", { name: "Imprimir Ticket" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Imprimir", exact: true }).click();
  await page.getByRole("button", { name: "Imprimir", exact: true }).click(); // Una vez dado a imprimir como validacoms que me carga el PDF con el dato correcto?
  await page
    .locator("div")
    .filter({ hasText: "¡Buen trabajo!Tu comprobante" })
    .nth(1)
    .click();

  // Scenario: Buscar pedido existente por código desde el campo correlativo
  // Given existen pedidos registrados previamente
  // And el usuario selecciona "Pedido"
  // And selecciona la serie del pedido
  // And ingresa el número de pedido en el campo correlativo
  // When realiza la búsqueda del pedido
  // Then el sistema debe mostrar el pedido encontrado
  // And debe cargar la información del pedido en pantalla

  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page.getByText("Seleccionar").nth(3).click();
  await page.locator('[id="cmn_cmp-overload:loading"]').click();
  await page.locator('[id="cmn_cmp-overload:loading"]').click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
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
  await page.getByText("item gravado sin control").click();
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click();
  await expect(page.getByText("¡Buen trabajo!")).toBeVisible();
  await expect(page.locator("body")).toContainText(
    "Tu comprobante fue emitido correctamente",
  );
  await page.getByRole("button", { name: "Nueva Venta" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page.getByText("BOLETAFACTURANOTA DE").click();
  await page.getByRole("button", { name: "Buscar pedidos" }).click();
  await page.getByRole("textbox", { name: "Correlativo" }).click();
  await page.getByRole("textbox", { name: "Correlativo" }).fill("8");
  await page.getByRole("textbox", { name: "Correlativo" }).press("Enter");
  await expect(
    page.getByRole("button", { name: "GUARDAR NUEVO PEDIDO" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ACTUALIZAR PEDIDO" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "PAGAR PEDIDO" }),
  ).toBeVisible();
  await page.locator(".icon.cerrado").click();
  await expect(page.getByText("item gravado sin control")).toBeVisible();

  // Scenario: Listar todos los pedidos desde la opción "Ver todos"
  // Given existen pedidos registrados previamente
  // And el usuario selecciona "Pedido"
  // When selecciona la opción "Ver todos"
  // Then el sistema debe mostrar la lista de pedidos de la sucursal
  // And debe permitir filtrar por "N° de pedido", "Cliente", "Caja" o "Tienda Virtual"

  await page.getByRole("button", { name: "Continuar vendiendo" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page.getByText("PEDIDO").click();
  await page.getByRole("button", { name: "Buscar pedidos" }).click();
  await expect(page.getByText("Ver todos")).toBeVisible();
  await page.getByText("Ver todos").click();
  await expect(page.locator("body")).toMatchAriaSnapshot(`
    - text: "Filtrar por: N° de pedido Cliente Caja Tienda Virtual PD01"
    - textbox "N° de pedido"
    - text: "/PD01 PD01-9 \\\\d+\\\\/\\\\d+\\\\/\\\\d+ \\\\d+:\\\\d+ am caja-auto S\\\\/\\\\d+\\\\.\\\\d+ 1 ítems Ver pedido Cargar pedido MARCELO EDWIN SOLANO GARAY Arequipa-auto DNI: \\\\d+ PD01-8 \\\\d+\\\\/\\\\d+\\\\/\\\\d+ \\\\d+:\\\\d+ am caja-auto S\\\\/\\\\d+\\\\.\\\\d+ 1 ítems Ver pedido Cargar pedido CLIENTES VARIOS - DNI: \\\\d+ PD01-7 \\\\d+\\\\/\\\\d+\\\\/\\\\d+ \\\\d+:\\\\d+ pm caja-auto S\\\\/\\\\d+\\\\.\\\\d+ 1 ítems Ver pedido Cargar pedido CLIENTES VARIOS - DNI: \\\\d+ PD01-6 \\\\d+\\\\/\\\\d+\\\\/\\\\d+ \\\\d+:\\\\d+ pm caja-auto S\\\\/\\\\d+\\\\.\\\\d+ 1 ítems Ver pedido Cargar pedido CLIENTES VARIOS - DNI: \\\\d+ PD01-5 \\\\d+\\\\/\\\\d+\\\\/\\\\d+ \\\\d+:\\\\d+ pm caja-auto S\\\\/\\\\d+\\\\.\\\\d+ 1 ítems Ver pedido Cargar pedido MARCELO EDWIN SOLANO GARAY Arequipa-auto DNI: \\\\d+/"
    - navigation:
      - link "chevron-left":
        - /url: "#"
      - text: Anterior
      - list:
        - listitem:
          - link "1":
            - /url: "#"
        - listitem:
          - link "2":
            - /url: "#"
      - text: Siguiente
      - link "chevron-right":
        - /url: "#"
    `); // Es es para verificar que se carga la grilla no se como podemos hacerlo
  await expect(
    page.locator(
      '[id="pv_cmp-facturacion_cmp-pedidos_cmp_lista-pedido:filter_section:section_tipo_tipo_item:cliente"]',
    ),
  ).toContainText("Cliente");
  await page.getByText("Cliente", { exact: true }).click();
  await page
    .locator(
      '[id="pv_cmp-facturacion_cmp-pedidos_cmp_lista-pedido:filter_section_v-input:cliente"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_cmp-facturacion_cmp-pedidos_cmp_lista-pedido:filter_section_v-input:cliente"]',
    )
    .fill("76958585");
  await page
    .getByText(
      "DNIDoc. Nacional de Identidad7695858599999999MARCELO EDWIN SOLANO GARAYArequipa",
    )
    .nth(1)
    .click();
  await page.locator("#undefined_delete").click();
  await page.getByText("N° de pedido").click();
  await page.getByRole("textbox", { name: "N° de pedido" }).click();
  await page.getByRole("textbox", { name: "N° de pedido" }).fill("8");
  await expect(
    page.locator("div").filter({ hasText: /^PD01-8$/ }),
  ).toBeVisible();

  // Scenario: Buscar pedido por número desde la lista de pedidos
  // Given el usuario visualiza la lista de pedidos
  // And selecciona el filtro "N° de pedido"
  // When ingresa el número de pedido
  // Then el sistema debe mostrar los pedidos coincidentes con la búsqueda

  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page.getByText("PEDIDO").click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.getByText("item gravado sin control").click();
  await page.locator("body").press("F10");
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click();
  await expect(page.locator("body")).toContainText("PD01-00000010");
  await expect(page.getByText("¡Buen trabajo!")).toBeVisible();
  await page.getByRole("button", { name: "Nueva Venta" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page.getByRole("button", { name: "Buscar pedidos" }).click();
  await page.getByText("Ver todos").click();
  await page.getByRole("textbox", { name: "N° de pedido" }).click();
  await page.getByRole("textbox", { name: "N° de pedido" }).fill("10");
  await expect(page.locator("body")).toContainText("PD01-10");
  await expect(page.getByText("S/10.56").nth(2)).toBeVisible();
  await page.locator(".drape.is-open > .button-close").click();

  // Scenario: Buscar pedido por cliente desde la lista de pedidos
  // Given el usuario visualiza la lista de pedidos
  // And selecciona el filtro "Cliente"
  // When ingresa el nombre o documento del cliente
  // Then el sistema debe mostrar los pedidos coincidentes con el cliente buscado

  await page
    .getByRole("button", { name: "Continuar vendiendo" })
    .nth(1)
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
  await page
    .getByRole("textbox", { name: "Buscar por nombre, razón" })
    .fill("76975258");

  await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
  await page
    .getByText(
      "DNIDoc. Nacional de Identidad7697525899999999JHUNIOR BRAYAN GUTIERREZav-ejemplo",
    )
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.getByText("item gravado sin control").click();
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click();
  await expect(
    page.locator('[id="pv_punto-venta_post-emision_v-button:imprimir-a4"]'),
  ).toContainText("Imprimir");
  await expect(page.getByText("¡Buen trabajo!")).toBeVisible();
  await page.getByRole("button", { name: "Nueva Venta" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page.getByRole("button", { name: "Buscar pedidos" }).click();
  await page.getByText("Ver todos").click();
  await expect(
    page.locator(
      '[id="pv_cmp-facturacion_cmp-pedidos_cmp_lista-pedido:filter_section:section_tipo_tipo_item:cliente"]',
    ),
  ).toContainText("Cliente");
  await page.getByText("Cliente", { exact: true }).click();
  await page
    .locator(
      '[id="pv_cmp-facturacion_cmp-pedidos_cmp_lista-pedido:filter_section_v-input:cliente"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_cmp-facturacion_cmp-pedidos_cmp_lista-pedido:filter_section_v-input:cliente"]',
    )
    .fill("76975258");
  await page
    .getByText(
      "DNIDoc. Nacional de Identidad7697525899999999JHUNIOR BRAYAN GUTIERREZav-ejemplo",
    )
    .nth(1)
    .click();
  await expect(page.locator("body")).toContainText("PD01-11"); // Estos correlativos seran variables entonces no sera hardcodeado

  await expect(page.locator("body")).toMatchAriaSnapshot(
    `- text: "/PD01-\\\\d+ \\\\d+\\\\/\\\\d+\\\\/\\\\d+ \\\\d+:\\\\d+ am caja-auto S\\\\/\\\\d+\\\\.\\\\d+ 1 ítems Ver pedido Cargar pedido JHUNIOR BRAYAN GUTIERREZ av-ejemplo-auto DNI: \\\\d+/"`,
  );
  await page.locator(".drape.is-open > .button-close > .icon").click();

  // Scenario: Buscar pedido por caja desde la lista de pedidos // Para este caso usaremos caja de ventas ya no la Auto
  // Given el usuario visualiza la lista de pedidos
  // And selecciona el filtro "Caja"
  // When ingresa o selecciona una caja
  // Then el sistema debe mostrar los pedidos asociados a la caja seleccionada

  await expect(
    page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("Caja de venta");
  await expect(page.getByText("Caja de venta")).toBeVisible();
  await page
    .getByRole("button", { name: "Continuar vendiendo" })
    .first()
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.getByText("item gravado sin control").click();
  await page
    .locator("div")
    .filter({ hasText: "Total1 ítemsS/" })
    .nth(5)
    .click();
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click();
  await expect(page.getByText("¡Buen trabajo!")).toBeVisible();
  await expect(page.locator("body")).toContainText(
    "Tu comprobante fue emitido correctamente",
  );
  await page.getByRole("button", { name: "Nueva Venta" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page.getByRole("button", { name: "Buscar pedidos" }).click();
  await page.getByText("Ver todos").click();
  await expect(
    page.getByText("Lista de Pedidos", { exact: true }),
  ).toBeVisible();
  await page.getByText("Caja", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Buscar por nombre de caja" })
    .click();
  await page
    .locator(
      '[id="pv_cmp-facturacion_cmp-pedidos_cmp_lista-pedido:filter_section_div:opcion-caja-0"]',
    )
    .getByText("Caja de venta")
    .click();
  await expect(page.getByText("Caja de venta").nth(1)).toBeVisible();
  await expect(page.locator("body")).toMatchAriaSnapshot(
    `- text: "/PD01-\\\\d+ \\\\d+\\\\/\\\\d+\\\\/\\\\d+ \\\\d+:\\\\d+ am Caja de venta S\\\\/\\\\d+\\\\.\\\\d+ 1 ítems Ver pedido Cargar pedido CLIENTES VARIOS - DNI: \\\\d+/"`,
  );
  await page.locator(".drape.is-open > .button-close").click();

  // Scenario: Ver pedido desde la lista de pedidos
  // Given el usuario visualiza la lista de pedidos
  // And existen pedidos disponibles en la lista
  // When selecciona la opción "Ver pedido" de un pedido
  // Then el sistema debe mostrar el detalle del pedido seleccionado
  // And no debe modificar el formulario actual

  await expect(
    page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("caja-auto");
  await expect(page.getByText("caja-autoContinuar vendiendo")).toBeVisible();
  await page
    .getByRole("button", { name: "Continuar vendiendo" })
    .nth(1)
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page.getByText("Ver todos").click();
  await page.getByRole("textbox", { name: "N° de pedido" }).click();
  await page.getByRole("textbox", { name: "N° de pedido" }).fill("9");
  await expect(page.locator("body")).toContainText("PD01-9");
  await page
    .locator(
      '[id="pv_punto-venta_cmp-pedido_cmp-lista-pedido_cmp-dropdown:opciones-pedido"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-pedido_cmp-lista-pedido_cmp-dropdown:opciones-pedido"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-pedido_cmp-lista-pedido_cmp-dropdown:opciones-pedido"]',
    )
    .click();
  const page1Promise = page.waitForEvent("popup");
  await page.getByText("Ver pedido").click();
  const page1 = await page1Promise;
  await page1.goto(
    "https://erpperu2-crt-4.smartclic.pe/punto-venta/comprobantes/2011/3252921",
  );
  await expect(
    page1.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("Datos del cliente");
  await expect(
    page1.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("Datos de la operación");
  await expect(page1.getByText("Pedido")).toBeVisible();
  await expect(page1.getByText("N° de DNI76958585")).toBeVisible();
  await expect(page1.getByText("Nombre / Razón socialMARCELO")).toBeVisible();
  await expect(page1.getByText("DirecciónArequipa-auto")).toBeVisible();
  await expect(
    page1.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("Telefono99999999");
  await expect(page1.getByText("N° de DNI76958585")).toBeVisible();
  await expect(page1.getByText("Nombre / Razón socialMARCELO")).toBeVisible();
  await expect(page1.getByText("DirecciónArequipa-auto")).toBeVisible();
  await expect(page1.getByText("Telefono99999999")).toBeVisible();
  await expect(
    page1.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toMatchAriaSnapshot(
    `- text: /Fecha de emisión \\d+\\/\\d+\\/\\d+ Fecha \\/ Hora de creación \\d+\\/\\d+\\/\\d+ \\d+:\\d+ Almacén ALMACEN-AUTO Moneda Soles Lista de precios Precio estándar Valor IGV \\d+% Estado de facturación No Estado de pago - Procedencia ERP2/`,
  );
  await expect(
    page1.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toMatchAriaSnapshot(`
    - text: Listado de ítems
    - table:
      - rowgroup:
        - row "N° Código Nombre Unidad Cantidad IGV Precio Descuento Total":
          - columnheader "N°"
          - columnheader "Código"
          - columnheader "Nombre"
          - columnheader "Unidad"
          - columnheader "Cantidad"
          - columnheader "IGV"
          - columnheader "Precio"
          - columnheader "Descuento"
          - columnheader "Total"
          - columnheader
      - rowgroup:
        - row /1 \\d+ item gravado sin control UNIDAD 1 S\\/ \\d+\\.\\d+ S\\/ \\d+\\.\\d+ S\\/ \\d+\\.\\d+ S\\/ \\d+\\.\\d+/:
          - cell "1"
          - cell /\\d+/
          - cell "item gravado sin control"
          - cell "UNIDAD"
          - cell "1"
          - cell /S\\/ \\d+\\.\\d+/
          - cell /S\\/ \\d+\\.\\d+/
          - cell /S\\/ \\d+\\.\\d+/
          - cell /S\\/ \\d+\\.\\d+/
          - cell
      - rowgroup:
        - row /Total 1 S\\/ \\d+\\.\\d+ S\\/ \\d+\\.\\d+ S\\/ \\d+\\.\\d+ S\\/ \\d+\\.\\d+/:
          - cell "Total"
          - cell
          - cell
          - cell
          - cell "1"
          - cell /S\\/ \\d+\\.\\d+/
          - cell /S\\/ \\d+\\.\\d+/
          - cell /S\\/ \\d+\\.\\d+/
          - cell /S\\/ \\d+\\.\\d+/
    `);
  await page1.getByRole("button", { name: "Salir" }).click();

  // Scenario: Cargar pedido desde la lista de pedidos
  // Given el usuario visualiza la lista de pedidos
  // And existen pedidos disponibles en la lista
  // When selecciona la opción "Cargar pedido" de un pedido
  // Then el sistema debe cerrar la lista de pedidos
  // And debe cargar en pantalla los datos del pedido seleccionado
  // And debe cargar cliente, productos, cantidades y datos registrados

  await expect(
    page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("caja-autoContinuar vendiendo");
  await page
    .getByRole("button", { name: "Continuar vendiendo" })
    .nth(1)
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page.getByText("Ver todos").click();
  await expect(
    page.getByText("Lista de Pedidos", { exact: true }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "N° de pedido" }).click();

  await page.getByRole("textbox", { name: "N° de pedido" }).click();
  await page.getByRole("textbox", { name: "N° de pedido" }).fill("9"); // este pedido no debe ser hardocdeado sino sacar de un test o crear una precondicion o usar el del test anterior pero el problema es que si solol ejecuto este test y no se creo los demas pedidos ahi esta elproblema o sino le crearemos la pre condicion:

  await expect(
    page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("caja-autoContinuar vendiendo");
  await page
    .getByRole("button", { name: "Continuar vendiendo" })
    .nth(1)
    .click();
  await page.locator(".datos").first().click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.getByText("item gravado sin control").click();
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]',
    )
    .dblclick();
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]',
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
  await page.getByRole("button", { name: "Datos" }).click();
  await page.getByRole("textbox", { name: "Nombre del vendedor" }).click();
  await page.getByRole("textbox", { name: "Nombre del vendedor" }).click();
  await page
    .getByRole("textbox", { name: "Nombre del vendedor" })
    .fill("76975258");
  await page
    .getByText(
      "DNIDoc. Nacional de Identidad7697525899999999Vendedor autoArequipa-Paucarpata",
    )
    .click();
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:orden-compra"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:orden-compra"]',
    )
    .fill("11");
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:contrato"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:contrato"]',
    )
    .fill("121");
  await page.getByRole("textbox", { name: "Ej. A1G-" }).click();
  await page.getByRole("textbox", { name: "Ej. A1G-" }).press("CapsLock");
  await page.getByRole("textbox", { name: "Ej. A1G-" }).fill("ABC-123");
  await page.getByRole("textbox", { name: "Ej. G001-" }).click();
  await page.getByRole("textbox", { name: "Ej. G001-" }).press("CapsLock");
  await page.getByRole("textbox", { name: "Ej. G001-" }).fill("");
  await page.getByRole("textbox", { name: "Ej. G001-" }).press("CapsLock");
  await page.getByRole("textbox", { name: "Ej. G001-" }).fill("G001");
  await page.getByRole("textbox", { name: "Ej. G001-" }).press("CapsLock");
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:comentarios"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:comentarios"]',
    )
    .fill("nevo pediido");
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:comentarios"]',
    )
    .fill("nuevo pedido");
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]',
    )
    .fill("pedido");
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]',
    )
    .fill("232132");
  await page.getByRole("button", { name: "Guardar datos" }).click();
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click();
  await expect(page.getByText("¡Buen trabajo!")).toBeVisible();
  await expect(page.getByText("Tu comprobante fue emitido")).toBeVisible();
  await expect(page.locator("body")).toContainText("PD01-00000013");
  await page.getByRole("button", { name: "Nueva Venta" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page.getByRole("button", { name: "Buscar pedidos" }).click();
  await page.getByText("Ver todos").click();
  await page.getByRole("textbox", { name: "N° de pedido" }).click();
  await page.getByRole("textbox", { name: "N° de pedido" }).fill("13");
  await page
    .locator(
      '[id="pv_punto-venta_cmp-pedido_cmp-lista-pedido_cmp-dropdown:opciones-pedido"]',
    )
    .click();
  await page.getByText("Cargar pedido").click();
  await expect(page.getByText("item gravado sin control")).toBeVisible();
  await page.getByRole("button", { name: "Datos" }).click();
  await expect(page.getByText("Vendedor auto7697525899999999")).toBeVisible();
  await expect(
    page.locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:orden-compra"]',
    ),
  ).toHaveValue("11");
  await expect(
    page.locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:contrato"]',
    ),
  ).toHaveValue("121");
  await expect(page.getByRole("textbox", { name: "Ej. A1G-" })).toHaveValue(
    "ABC-123",
  );
  await expect(page.getByRole("textbox", { name: "Ej. G001-" })).toHaveValue(
    "G001",
  );
  await expect(
    page.locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]',
    ),
  ).toHaveValue("pedido");
  await expect(
    page.locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]',
    ),
  ).toHaveValue("232132");
  await expect(page.getByText("Datos adicionales").nth(1)).toBeVisible();

  // Given el usuario carga un pedido existente
  // And modifica información del cliente o productos registrados
  // When guarda los cambios del pedido
  // Then el sistema debe actualizar la información del pedido correctamente
  // And debe conservar el mismo código de pedido
  await expect(
    page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("caja-autoContinuar vendiendo");
  await page
    .getByRole("button", { name: "Continuar vendiendo" })
    .nth(1)
    .click();
  await page.locator(".datos").first().click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("151515");
  await page.getByText("item gravado sin control").click();
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]',
    )
    .dblclick();
  await page
    .locator(
      '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]',
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
  await page.getByRole("button", { name: "Datos" }).click();
  await page.getByRole("textbox", { name: "Nombre del vendedor" }).click();
  await page.getByRole("textbox", { name: "Nombre del vendedor" }).click();
  await page
    .getByRole("textbox", { name: "Nombre del vendedor" })
    .fill("76975258");
  await page
    .getByText(
      "DNIDoc. Nacional de Identidad7697525899999999Vendedor autoArequipa-Paucarpata",
    )
    .click();
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:orden-compra"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:orden-compra"]',
    )
    .fill("11");
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:contrato"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:contrato"]',
    )
    .fill("121");
  await page.getByRole("textbox", { name: "Ej. A1G-" }).click();
  await page.getByRole("textbox", { name: "Ej. A1G-" }).press("CapsLock");
  await page.getByRole("textbox", { name: "Ej. A1G-" }).fill("ABC-123");
  await page.getByRole("textbox", { name: "Ej. G001-" }).click();
  await page.getByRole("textbox", { name: "Ej. G001-" }).press("CapsLock");
  await page.getByRole("textbox", { name: "Ej. G001-" }).fill("");
  await page.getByRole("textbox", { name: "Ej. G001-" }).press("CapsLock");
  await page.getByRole("textbox", { name: "Ej. G001-" }).fill("G001");
  await page.getByRole("textbox", { name: "Ej. G001-" }).press("CapsLock");
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:comentarios"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:comentarios"]',
    )
    .fill("nevo pediido");
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:comentarios"]',
    )
    .fill("nuevo pedido");
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]',
    )
    .fill("pedido");
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]',
    )
    .click();
  await page
    .locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]',
    )
    .fill("232132");
  await page.getByRole("button", { name: "Guardar datos" }).click();
  await page.getByRole("button", { name: "GUARDAR PEDIDO" }).click();
  await expect(page.getByText("¡Buen trabajo!")).toBeVisible();
  await expect(page.getByText("Tu comprobante fue emitido")).toBeVisible();
  await expect(page.locator("body")).toContainText("PD01-00000013");
  await page.getByRole("button", { name: "Nueva Venta" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^BOLETA$/ })
    .nth(1)
    .click();
  await page
    .locator(
      '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2011"]',
    )
    .click();
  await page.getByRole("button", { name: "Buscar pedidos" }).click();
  await page.getByText("Ver todos").click();
  await page.getByRole("textbox", { name: "N° de pedido" }).click();
  await page.getByRole("textbox", { name: "N° de pedido" }).fill("13");
  await page
    .locator(
      '[id="pv_punto-venta_cmp-pedido_cmp-lista-pedido_cmp-dropdown:opciones-pedido"]',
    )
    .click();
  await page.getByText("Cargar pedido").click();
  await expect(page.getByText("item gravado sin control")).toBeVisible();
  await page.getByRole("button", { name: "Datos" }).click();
  await expect(page.getByText("Vendedor auto7697525899999999")).toBeVisible();
  await expect(
    page.locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:orden-compra"]',
    ),
  ).toHaveValue("11");
  await expect(
    page.locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:contrato"]',
    ),
  ).toHaveValue("121");
  await expect(page.getByRole("textbox", { name: "Ej. A1G-" })).toHaveValue(
    "ABC-123",
  );
  await expect(page.getByRole("textbox", { name: "Ej. G001-" })).toHaveValue(
    "G001",
  );
  await expect(
    page.locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]',
    ),
  ).toHaveValue("pedido");
  await expect(
    page.locator(
      '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]',
    ),
  ).toHaveValue("232132");
  await expect(page.getByText("Datos adicionales").nth(1)).toBeVisible(); // Seria lo mismo que el anterior test pero aqui le agregaremos otros item mas y cambiaremos algunas cosas:

  await page.getByRole("button", { name: "Cancelar" }).click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .click();
  await page
    .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
    .fill("83838383");
  await page.getByText("Item solo almacen-auto X2").click();
  await expect(
    page.getByText("Item solo almacen-auto X2Precio sin IGV S/8.94IGV S/"),
  ).toBeVisible();
  await page.locator(".icon.cerrado").click();
  await expect(page.getByRole("main")).toContainText("Total2 ítemsS/63.33");
  await page.locator("#undefined_delete").click();
  await expect(
    page.getByRole("textbox", { name: "Buscar por nombre, razón" }),
  ).toBeEmpty();
  await page.getByRole("button", { name: "ACTUALIZAR PEDIDO" }).click();
  await expect(page.getByText("¡Buen trabajo!")).toBeVisible();
  await expect(page.getByText("Tu comprobante fue emitido")).toBeVisible();
  await page.getByRole("button", { name: "Nueva Venta" }).click();

  // Esto es adicional cada que vez que acabe toda la emision queria que se cierre la caja

  await page.getByText("Ventas y compras").click();
  await page.getByText("Ver cajas").click();
  await page.goto("https://erpperu2-crt-4.smartclic.pe/punto-venta/cajas");
  await expect(page.getByText("caja-autoContinuar vendiendo")).toBeVisible();
  await page
    .getByRole("button", { name: "Continuar vendiendo" })
    .nth(1)
    .click();
  await page.locator("div").filter({ hasText: "MENÚ" }).nth(3).click();
  await page.locator("div").nth(3).click();
  await page.getByText("Cierre de caja").click();
  await page.getByRole("button", { name: "Cerrar caja" }).click();
  await page.getByRole("button", { name: "Cerrar caja" }).click();
  await expect(page.getByText("S/ 862.10")).toBeVisible();
  await page.getByRole("textbox", { name: "S/" }).first().click();
  await page.getByRole("textbox", { name: "S/" }).first().fill("862.10");
  await expect(
    page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),
  ).toContainText("S/ 454.00");
  await expect(page.getByText("S/ 454.00")).toBeVisible();
  await page.getByRole("textbox", { name: "S/" }).nth(1).click();
  await page.getByRole("textbox", { name: "S/" }).nth(1).fill("454");
  await expect(page.getByText("S/ 20.50").first()).toBeVisible();
  await page.getByRole("textbox", { name: "S/" }).nth(2).click();
  await page.getByRole("textbox", { name: "S/" }).nth(2).fill("20.50");
  await expect(page.getByText("S/ 20.50").nth(1)).toBeVisible();
  await page.getByRole("group").nth(3).click();
  await page.getByRole("textbox", { name: "S/" }).nth(3).fill("20.50");
  await expect(page.getByText("Cerrar caja: caja-auto")).toBeVisible();
  await page.getByRole("button", { name: "Confirmar cierre de caja" }).click();
  await page
    .getByRole("button", { name: "Confirmar cierre", exact: true })
    .click();
  await page.getByRole("button", { name: "Aceptar" }).click();
  await expect(page.getByText("caja-autoAperturar caja")).toBeVisible();
});
