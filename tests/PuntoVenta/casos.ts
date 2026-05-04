import { test } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto("https://erpperu2-crt.smartclic.pe/auth/login");

    // Feature: Emisión de Factura, Boleta y Nota de venta

    // # ==================== BOLETA ====================

    // Scenario: Emitir una boleta con productos con control de stock
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Boleta"
    //   And define una fecha de emisión dentro de los últimos 4 días
    //   And tiene una venta válida con productos con control de stock
    //   When confirma la emisión del comprobante
    //   Then el sistema debe emitir la boleta correctamente
    //   And la boleta debe visualizarse en la lista de comprobantes
    //   And el comprobante debe estar en estado aceptado por SUNAT
    //   And el stock del producto debe disminuir según la cantidad vendida
    //   And debe registrarse un movimiento de salida en el kardex del producto

    await page.getByText("Ventas y compras").click();
    await page.getByText("Nueva venta", { exact: true }).click();

    await page.getByRole("button", { name: "Aperturar caja" }).click();
    await page.getByRole("button", { name: "Apertura", exact: true }).click();
    await page.getByRole("button", { name: "Sí, aperturar" }).click();
    await page.getByText("BOLETA").first().click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1004"]',
        )
        .getByText("BOLETA")
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-input:fecha"]',
        )
        .click();
    await page.getByRole("button", { name: "domingo, 19 de abr de" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("121212");
    await page.getByText("121212)").click();
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "Monto exacto" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();

    await page.locator(".v-icon-back > .icon").click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:abrir-acciones-comprobante"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_acciones_li:bitacora"]',
        )
        .click();
    await page.getByText("Creación", { exact: true }).click();
    await page.locator(".drape.is-open > .button-close").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Stock de productos").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByRole("cell", { name: "Varios*" }).click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Kardex total").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByText("Varios*").click();
    await page.getByRole("button", { name: "Kardex por producto" }).click();
    await page.getByRole("button", { name: "VER DETALLE" }).nth(1).click();

    // Scenario: Bloquear emisión de boleta con fecha fuera del rango permitido
    //   Given que el usuario selecciona el tipo de comprobante "Boleta"
    //   And define una fecha con más de 4 días de antigüedad
    //   When intenta confirmar la emisión
    //   Then el sistema no debe permitir la emisión
    //   And debe mostrar una validación visible por fecha

    await page.getByText("Ventas y compras").click();
    await page.getByText("Nueva venta", { exact: true }).click();
    await page.goto("https://erpperu2-crt-3.smartclic.pe/punto-venta/cajas");
    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("121212");
    await page.getByText("121212").click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-input:fecha"]',
        )
        .click();
    await page.getByRole("button", { name: "miércoles, 22 de abr de" }).click(); // en el sistema solo permite 4 dias de antiguedad por lo que si dpy click en una fecha como el 22 de abril y hoy estamos 27 entonces no deja poner esa fecha  y por ende no procede el pago del comprobante

    // Scenario: Emitir una boleta sin cliente con monto menor a 700
    //   Given que el usuario selecciona el tipo de comprobante "Boleta"
    //   And no selecciona cliente
    //   And tiene una venta válida con total menor a 700 soles
    //   When confirma la emisión
    //   Then el sistema debe emitir la boleta correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("121212");
    await page.getByText("121212").click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad_div:increase"]',
        )
        .click();
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "Monto exacto" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();

    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248776"]',
        )
        .click();
    await page.getByText("Bitácora").click();
    await page.getByText("Creación", { exact: true }).click();
    await page.locator(".drape.is-open > .button-close > .icon").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Stock de productos").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByText("Varios*").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Kardex total").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByText("Varios*").click();
    await page.getByRole("button", { name: "Kardex por producto" }).click();
    await page.getByRole("button", { name: "VER DETALLE" }).first().click();
    const page1Promise = page.waitForEvent("popup");
    await page.getByText("B001-").click(); // AL DARA CLICK en en el enlace del comprobante se abre una nueva pestaña con el detalle del comprobante, por lo que se espera ese evento de apertura de nueva pestaña para luego interactuar con ella
    const page1 = await page1Promise;

    // Scenario: Bloquear emisión de boleta sin cliente con monto mayor o igual a 700
    //   Given que el usuario selecciona el tipo de comprobante "Boleta"
    //   And no selecciona cliente
    //   And tiene una venta válida con total mayor o igual a 700 soles
    //   When intenta confirmar la emisión
    //   Then el sistema no debe permitir la emisión
    //   And debe mostrar una validación visible

    await page.getByText("Ventas y compras").click();
    await page.getByText("Nueva venta").click();
    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("121212");
    await page.getByText("121212").click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]',
        )
        .fill("750.00"); // Se edita el precio del producto para que el total de la venta sea mayor a 700 soles y así probar el bloqueo de emisión de boleta sin cliente para ventas mayores a ese monto
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]',
        )
        .click();
    await page.getByRole("button", { name: "PAGAR" }).click(); // ada dar en pagar se debe esperar a que el sistema de un modal de error ; en el codigo se esperara un expect.getbytext('Selecciona un cliente para montos mayores a S/ 700') para asegurarnos que el sistema esta mostrando la validacion correcta al intentar emitir una boleta sin cliente para ventas mayores a 700 soles
    await page.getByRole("button", { name: "Aceptar" }).click();

    // Scenario: Emitir una boleta con descuento por ítem por monto
    //   Given que el usuario selecciona el tipo de comprobante "Boleta"
    //   And tiene una venta válida
    //   And aplica un descuento por ítem monto
    //   When confirma la emisión
    //   Then el sistema debe emitir la boleta correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("121212");
    await page.getByText("121212").click();
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
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-grilla-items:grilla_cmp-producto:item_v-step:cantidad_div:increase"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]',
        )
        .click();
    await page.getByText("%", { exact: true }).click();
    await page.getByText("Monto").click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:descuento"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:descuento"]',
        )
        .fill("5");
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]',
        )
        .click();
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "YAPE" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248777"]',
        )
        .click();
    await page.getByText("Bitácora").click();
    await page.locator(".drape.is-open > .button-close > .icon").click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Stock de productos").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByText("Varios*").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Kardex total").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByRole("button", { name: "Kardex por producto" }).click();
    await page.getByRole("button", { name: "VER DETALLE" }).first().click();
    const page2Promise = page.waitForEvent("popup");
    await page.getByText("B001-3").click();
    const page2 = await page2Promise;
    await page2.getByText("Descuento", { exact: true }).click();

    // Scenario: Emitir una boleta con descuento global porcentaje
    //   Given que el usuario selecciona el tipo de comprobante "Boleta"
    //   And tiene una venta válida
    //   And aplica un descuento global por porcentaje
    //   When confirma la emisión
    //   Then el sistema debe emitir la boleta correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("121212");
    await page.getByText("121212").click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad"]',
        )
        .fill("");
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad"]',
        )
        .press("ArrowUp");
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad"]',
        )
        .fill("10");
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:detalles"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_cmp-descuento-pedido_v-input:valor"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_cmp-descuento-pedido_v-input:valor"]',
        )
        .fill("50");
    await page.getByRole("button", { name: "Aplicar descuento" }).click();
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "Monto exacto" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248778"]',
        )
        .click();
    await page.getByText("Bitácora").click();
    await page.locator(".drape.is-open > .button-close").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Stock de productos").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByText("Varios*").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Kardex total").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByRole("button", { name: "Kardex por producto" }).click();
    await page.getByRole("button", { name: "VER DETALLE" }).first().click();
    const page3Promise = page.waitForEvent("popup");
    await page.getByText("B001-4").click();
    const page3 = await page3Promise;

    await page3.getByText("Descuento GlobalS/").click();

    // Scenario: Emitir una boleta con descuento por ítem por monto exacto y descuento global en porcentaje
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Boleta"
    //   And tiene una venta válida con al menos dos ítems
    //   And aplica un descuento por ítem por monto exacto a uno de los ítems
    //   And aplica un descuento global en porcentaje a la venta
    //   When confirma la emisión del comprobante
    //   Then el sistema debe emitir la boleta correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT

    await page.getByText("Ventas y compras").click();
    await page.getByText("Nueva venta").click();
    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();

    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("121212");
    await page.getByText("121212").click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]',
        )
        .click();
    await page.getByText("%", { exact: true }).click();
    await page.getByText("Monto").click();
    await page.getByText("Porcentaje").click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:descuento"]',
        )
        .fill("2");
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:detalles"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_cmp-descuento-pedido_v-input:valor"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_cmp-descuento-pedido_v-input:valor"]',
        )
        .fill("2");
    await page.getByRole("button", { name: "Aplicar descuento" }).click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:totales"]',
        )
        .click();
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "Monto exacto" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();

    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248779"]',
        )
        .click();
    await page.getByText("Bitácora").click();
    await page.locator(".drape.is-open > .button-close > .icon").click();
    await page
        .getByText(
            "Actualización y datos del comprobanteTodos7Creación7Actualización0Eliminació",
        )
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByText("Varios*").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Kardex total").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByText("Varios*").click();
    await page.getByRole("button", { name: "Kardex por producto" }).click();
    await page.getByRole("button", { name: "VER DETALLE" }).first().click();
    const page4Promise = page.waitForEvent("popup");
    await page.getByText("B001-5").click();
    const page4 = await page4Promise;
    await page4.locator("span > .icon").click();
    await page4.locator("span > .icon").click();

    // Scenario: Emitir una boleta con ítem con equivalencia
    //   Given que el usuario selecciona el tipo de comprobante "Boleta"
    //   And tiene una venta válida con un ítem con equivalencia y control de stock
    //   When confirma la emisión
    //   Then el sistema debe emitir la boleta correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT
    //   And el stock del ítem base debe disminuir según el factor de equivalencia
    //   And debe registrarse un movimiento de salida en el kardex del ítem base

    await page.getByText("Ventas y compras").click();
    await page.getByText("Nueva venta").click();
    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("202020");
    await page.getByText("item equivalente flexible").click();
    await page.getByText("Equivalente X2").click();
    await page.locator(".cmp-informacion-item > div").first().click();
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "Monto exacto" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248780"]',
        )
        .click();
    await page.getByText("Bitácora").click();
    await page.locator(".drape.is-open > .button-close").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Stock de productos").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("202020");
    await page.getByText("Varios*").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Kardex total").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("202020");
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .press("Enter");
    await page.getByRole("cell", { name: "Varios*" }).click();
    await page.getByRole("button", { name: "Kardex por producto" }).click();
    await page.getByRole("button", { name: "VER DETALLE" }).nth(1).click();
    await page.getByText("M001-S-").click();
    await page.getByText("Datos opcionales").click();
    await page.locator(".v-modal > div").first().click();
    const page5Promise = page.waitForEvent("popup");
    await page.getByText("B001-").click();
    const page5 = await page5Promise;

    // Scenario: Emitir una boleta con combo con control de stock
    //   Given que el usuario selecciona el tipo de comprobante "Boleta"
    //   And tiene una venta válida con un combo cuyos componentes manejan stock
    //   When confirma la emisión
    //   Then el sistema debe emitir la boleta correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT
    //   And debe disminuir el stock de cada componente del combo
    //   And debe registrarse un movimiento de salida en el kardex de cada componente

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("222222");
    await page.getByText("combo hijo exonegaro item").click();
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "Monto exacto" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();

    await page.getByText("Ventas y compras").click();
    await page
        .locator(
            '[id="nvg_selects_cmp-header-selects_select:select-module-107-item-1013"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248784"]',
        )
        .click();
    await page.getByText("Bitácora").click();
    await page.locator(".drape.is-open > .button-close > .icon").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Stock de productos").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("111111");
    await page.getByText("Varios*").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Kardex total").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("111111");
    await page.getByRole("button", { name: "Kardex por producto" }).click();
    await page.getByRole("button", { name: "VER DETALLE" }).first().click();

    await page.getByText("M001-S-1741").click();
    await page.getByText("Datos opcionales").click();
    await page.locator(".v-modal > div").first().click();
    const page6Promise = page.waitForEvent("popup");
    await page.getByText("B001-10").click();
    const page6 = await page6Promise;

    // Scenario: Emitir una boleta de adelanto
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Boleta"
    //   And activa el switch "Adelanto"
    //   And define una fecha de emisión dentro de los últimos 4 días
    //   And ingresa un monto válido para adelanto
    //   When confirma la emisión del comprobante
    //   Then el sistema debe emitir la boleta como adelanto correctamente
    //   And la boleta debe visualizarse en la lista de comprobantes
    //   And el comprobante debe estar en estado aceptado por SUNAT
    //   And no debe generarse ningún movimiento de salida de stock
    //   And no debe registrarse ningún movimiento en el kardex

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("121212");
    await page.getByText("Item para combos gravado").click();

    await page.getByText("AÑADIR CAMPOS").click();
    await page.getByText("Almacén").click();
    await page.getByText("Lista de precios").click();
    await page.getByText("Valor IGV").click();
    await page.getByText("Doc. de adelanto").click();
    await page.getByText("Doc. de detracción").click();
    await page.getByText("Doc. de retención").click();
    await page.getByText("Doc. de exportación").click();
    await page.getByRole("button", { name: "Guardar vista" }).first().click();
    await page.locator(".v-modal > div").first().click();
    await page
        .locator(
            "div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider",
        )
        .click(); // este switch es de Doc.Adelanto, al activarlo se convierte la boleta en un comprobante de adelanto

    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-input:fecha"]',
        )
        .click();
    await page.getByRole("button", { name: "sábado, 25 de abr de" }).click(); // se selecciona una fecha dentro de los ultimos 4 dias para que el sistema permita emitir la boleta de adelanto, si se selecciona una fecha con mas de 4 dias de antiguedad el sistema no permite emitir la boleta de adelanto
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "Monto exacto" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248786"]',
        )
        .click();
    await page.getByText("Bitácora").click(); // Aqui en bitacora no debe haber nigun texto que diga que se desconto el stock o que se registro un movimiento en el kardex porque al ser una boleta de adelanto no debe afectar el stock ni el kardex  no debe haber esto:
    // Descargo de Inventarios
    // 27/04/26
    // 09:26:21 am
    // admin
    // 04/27/2026 09:26:16: Se descargaron los Inventarios. Movimientos generados -> M001-S-1741

    // Antes de esta prueba se haran las creacion de los datos necesario para usar estos campos
    // cuando se inicie sesion se habra lo de los clientesy proveedores:

    await page.getByText("Clientes y proveedores").click();
    await page.getByText("Vendedores").click();
    await page.getByText("Crear vendedor", { exact: true }).click();
    await page
        .locator(
            '[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-input:num-document"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_proveedores_form-registro-relacionado-entidad:form_basico:v-input:num-document"]',
        )
        .fill("76975258");
    await page
        .getByRole("textbox", { name: "Ej. Ladrillería Distribuidora" })
        .click();
    await page
        .getByRole("textbox", { name: "Ej. Ladrillería Distribuidora" })
        .press("CapsLock");
    await page
        .getByRole("textbox", { name: "Ej. Ladrillería Distribuidora" })
        .fill("V");
    await page
        .getByRole("textbox", { name: "Ej. Ladrillería Distribuidora" })
        .press("CapsLock");
    await page
        .getByRole("textbox", { name: "Ej. Ladrillería Distribuidora" })
        .fill("Vendedor auto");
    await page
        .locator(
            '[id="pv_vendedores_form-registro-relacionado-entidad:form_basico:v-input:meta-monto"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_vendedores_form-registro-relacionado-entidad:form_basico:v-input:meta-monto"]',
        )
        .fill("2500");
    await page
        .locator(
            '[id="pv_vendedores_form-registro-relacionado-entidad:form_basico:v-input:meta-cantidad"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_vendedores_form-registro-relacionado-entidad:form_basico:v-input:meta-cantidad"]',
        )
        .fill("3500");
    await page.getByRole("textbox", { name: "Lima sur" }).click();
    await page.getByRole("textbox", { name: "Lima sur" }).press("CapsLock");
    await page.getByRole("textbox", { name: "Lima sur" }).fill("A");
    await page.getByRole("textbox", { name: "Lima sur" }).press("CapsLock");
    await page.getByRole("textbox", { name: "Lima sur" }).fill("Arequipa ");
    await page.getByRole("textbox", { name: "Lima sur" }).press("CapsLock");
    await page.getByRole("textbox", { name: "Lima sur" }).fill("Arequipa S");
    await page.getByRole("textbox", { name: "Lima sur" }).press("CapsLock");
    await page.getByRole("textbox", { name: "Lima sur" }).fill("Arequipa Sur");
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .click();
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .press("CapsLock");
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .fill("A");
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .press("CapsLock");
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .fill("Arequipa-");
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .press("CapsLock");
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .fill("Arequipa-P");
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .press("CapsLock");
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .fill("Arequipa-Paucarpata");
    await page.getByRole("textbox", { name: "Ej. 954588556" }).click();
    await page.getByRole("textbox", { name: "Ej. 954588556" }).fill("99999999");
    await page.getByRole("textbox", { name: "Ej. usuario@correo.com" }).click();
    await page
        .getByRole("textbox", { name: "Ej. usuario@correo.com" })
        .fill("automatizacionerp2@gmail.com");
    await page.getByRole("button", { name: "Crear vendedor" }).click();

    await page.locator(".v-modal > div").first().click();
    await page
        .locator(
            '[id="pv_vendedores_cmp-lista-proveedores-body-options:cmp-dropdown:opciones-proveedores:vendedor-1868063"]',
        )
        .click();
    await page.getByText("Ver bitácora").click();
    await page.locator(".drape.is-open > .button-close > .icon").click();

    //Ahora los campos adicionales ya esto lo haremos dentro de la caja de venta

    await page.getByText("Ventas y compras").click();
    await page.getByText("Nueva venta").click();
    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page.getByRole("button", { name: "Datos" }).click();
    await page.getByText("Nuevo campo adicional").click();
    await page.getByText("Campo de texto").click();
    await page.getByRole("textbox", { name: "Digitar nombre" }).click();
    await page.getByRole("textbox", { name: "Digitar nombre" }).press("CapsLock");
    await page.getByRole("textbox", { name: "Digitar nombre" }).fill("N");
    await page.getByRole("textbox", { name: "Digitar nombre" }).press("CapsLock");
    await page
        .getByRole("textbox", { name: "Digitar nombre" })
        .fill("tipo de comprobante");
    await page.getByText("Selecciona documentos").click();
    await page.getByText("Todos").click();
    await page.locator(".vector").click();
    await page.getByRole("button", { name: "Crear campo" }).click();
    await page.locator(".v-modal > div").first().click();
    await page.getByText("Nuevo campo adicional").click();
    await page.getByText("Campo de fecha").click();
    await page.getByRole("textbox", { name: "Digitar nombre" }).click();
    await page
        .getByRole("textbox", { name: "Digitar nombre" })
        .fill("fecha-comprobante");
    await page.getByText("Selecciona documentos").click();
    await page.getByText("Todos").click();
    await page
        .locator("div")
        .filter({ hasText: /^Todos$/ })
        .nth(2)
        .click();
    await page.getByRole("button", { name: "Crear campo" }).click();
    await page.locator(".v-modal > div").first().click();
    await page.getByText("Nuevo campo adicional").click();
    await page.getByText("Campo de selección").click();
    await page.getByRole("textbox", { name: "Digitar nombre" }).click();
    await page.getByRole("textbox", { name: "Digitar nombre" }).fill("entorno");
    await page.getByText("Selecciona documentos").click();
    await page.getByText("Todos").click();
    await page
        .locator("div")
        .filter({ hasText: /^Todos$/ })
        .nth(3)
        .click();
    await page.getByRole("textbox", { name: "Opción 1" }).click();
    await page.getByRole("textbox", { name: "Opción 1" }).fill("certificación");
    await page.getByRole("textbox", { name: "Opción 2" }).click();
    await page.getByRole("textbox", { name: "Opción 2" }).fill("producción");
    await page
        .locator(
            ".checkbox-container > .v-checkbox > .v-checkbox-base > .v-checkbox-default-label > span",
        )
        .first();
    await page.getByText("Nuevo campo adicional").click();
    await page.getByText("Campo de número").click();
    await page.getByRole("textbox", { name: "Digitar nombre" }).click();
    await page
        .getByRole("textbox", { name: "Digitar nombre" })
        .fill("numero-comprobante");
    await page
        .locator("div")
        .filter({ hasText: /^Selecciona documentos$/ })
        .nth(2)
        .click();
    await page.getByText("Todos").click();
    await page
        .locator("div")
        .filter({ hasText: /^Todos$/ })
        .nth(3)
        .click();
    await page.getByRole("button", { name: "Crear campo" }).click();
    await page.locator(".v-modal > div").first().click();
    await page.getByRole("button", { name: "Guardar datos" }).click();
    await page.getByRole("button", { name: "Crear campo" }).click();
    // Tambien se creara los clientes:

    await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
    await page.getByRole("button", { name: "Agregar cliente" }).click();
    await page
        .locator(
            '[id="pv_clientes_form-registro-relacionado-entidad:form_basico:v-input:num-document"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_clientes_form-registro-relacionado-entidad:form_basico:v-input:num-document"]',
        )
        .fill("76958585");
    await page.getByRole("button", { name: "Consultar SUNAT/RENIEC" }).click();
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .click();
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .press("CapsLock");
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .fill("A");
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .press("CapsLock");
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .fill("Arequipa-auto");
    await page.getByRole("textbox", { name: "Ej. 987 654" }).click();
    await page.getByRole("textbox", { name: "Ej. 987 654" }).fill("99999999");
    await page.getByRole("textbox", { name: "Ej. usuario@correo.com" }).click();
    await page
        .getByRole("textbox", { name: "Ej. usuario@correo.com" })
        .fill("automatizacionerp2@gmail.com");
    await page.getByRole("button", { name: "Crear cliente" }).click();
    await page.locator("#undefined_delete").click();
    await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
    await page.getByRole("button", { name: "Agregar cliente" }).click();
    await page
        .locator(
            '[id="pv_clientes_form-registro-relacionado-entidad:form_basico:v-select:tipo-documento"]',
        )
        .nth(5)
        .click();
    await page.getByText("RUC").click();
    await page
        .locator(
            '[id="pv_clientes_form-registro-relacionado-entidad:form_basico:v-input:num-document"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_clientes_form-registro-relacionado-entidad:form_basico:v-input:num-document"]',
        )
        .fill("20759685854");
    await page
        .getByRole("textbox", { name: "Ej. Ladrillería Distribuidora" })
        .fill("automatizacionerp2 cliente RUC ");
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .click();
    await page
        .getByRole("textbox", { name: "Ej. Calle Los Manzanos 120," })
        .fill("arequipa auto");
    await page.getByRole("textbox", { name: "Ej. 987 654" }).click();
    await page.getByRole("textbox", { name: "Ej. 987 654" }).fill("99999999");
    await page.getByRole("textbox", { name: "Ej. usuario@correo.com" }).click();
    await page
        .getByRole("textbox", { name: "Ej. usuario@correo.com" })
        .fill("automatizacionerp2@gmail.com");
    await page.getByRole("button", { name: "Crear cliente" }).click();

    // Scenario: Emitir una boleta con datos adicionales
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Boleta"
    //   And define una fecha de emisión dentro de los últimos 4 días
    //   And tiene una venta válida en el carrito
    //   When abre "Datos opcionales"
    //   And registra información válida en los datos adicionales
    //   And guarda los datos
    //   And confirma la emisión del comprobante
    //   Then el sistema debe emitir la boleta correctamente
    //   And la boleta debe visualizarse en la lista de comprobantes
    //   And el comprobante debe estar en estado aceptado por SUNAT

    await page.getByText("Ventas y compras").click();
    await page
        .locator("div")
        .filter({ hasText: /^Nueva venta$/ })
        .click();
    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("151515");
    await page.getByText("item gravado sin control").click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-input:fecha"]',
        )
        .click();
    await page.getByRole("button", { name: "viernes, 24 de abr de" }).click();
    await page.getByRole("button", { name: "Datos" }).click();

    await page.getByRole("textbox", { name: "Nombre del vendedor" }).click();

    await page.getByRole("textbox", { name: "Nombre del vendedor" }).click();
    await page.getByRole("textbox", { name: "Nombre del vendedor" }).fill("");
    await page
        .getByRole("textbox", { name: "Nombre del vendedor" })
        .press("CapsLock");
    await page.getByRole("textbox", { name: "Nombre del vendedor" }).fill("V");
    await page
        .getByRole("textbox", { name: "Nombre del vendedor" })
        .press("CapsLock");
    await page
        .getByRole("textbox", { name: "Nombre del vendedor" })
        .fill("Vendedor auto");
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
        .fill("121");
    await page
        .locator(
            '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:contrato"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:contrato"]',
        )
        .fill("12");
    await page.getByRole("textbox", { name: "Ej. A1G-" }).click();
    await page.getByRole("textbox", { name: "Ej. A1G-" }).fill("abc-123");
    await page.getByRole("textbox", { name: "Ej. G001-" }).click();
    await page.getByRole("textbox", { name: "Ej. G001-" }).press("CapsLock");
    await page.getByRole("textbox", { name: "Ej. G001-" }).fill("G");
    await page.getByRole("textbox", { name: "Ej. G001-" }).press("CapsLock");
    await page.getByRole("textbox", { name: "Ej. G001-" }).fill("G001-0001");
    await page
        .locator(
            '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:comentarios"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:comentarios"]',
        )
        .fill("observacion para datos adicionales con boleta");
    await page
        .locator(
            '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]',
        )
        .fill("boleta");
    await page
        .locator(
            '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]',
        )
        .fill("123123");
    await page.getByText("certificación").first().click();
    await page.getByText("certificación").nth(1).click();
    await page
        .locator(
            '[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-datepicker:campo-fecha-0"]',
        )
        .click();
    await page.getByRole("button", { name: "jueves, 23 de abr de" }).click();
    await page.getByRole("button", { name: "Guardar datos" }).click();
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "Monto exacto" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248787"]',
        )
        .click();
    const page7Promise = page.waitForEvent("popup");
    await page.getByRole("link", { name: "Ver comprobante" }).click(); // el ver comprobante desde busqeuda de comproabtnes tambien nos lleva a otra ventan donde ahi se hace click en acciones extra y ahi despues Datos opcionales para verificar que se muestren los datos adicionales que se registraron al emitir la boleta
    const page7 = await page7Promise;
    await page7.getByRole("button", { name: "Acciones extra" }).click();
    await page7.getByText("Datos opcionales").click();
    await page7.locator(".drape.is-open > .button-close > .icon").click();

    // Scenario: Visualizar precuenta de una boleta antes de emitir
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Boleta"
    //   And tiene una venta válida en el carrito
    //   When hace clic en "Precuenta" A4
    //   Then el sistema debe mostrar la precuenta de la operación
    //   And la información de ítems e importes debe corresponder a la venta actual

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("151515");
    await page.getByText("item gravado sin control").click();
    await page.getByText("BOLETA").first().click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1004"]',
        )
        .getByText("BOLETA")
        .click();
    await page.getByRole("button", { name: "PRECUENTA" }).click(); // Al abrir precuenta abre una venta que se superpone a todo y no fue posible captar con codegen pero si se debe verificar que la precuenta muestra mo mismo que el carrito/lista de items con los precios del total y los importes en general

    // Scenario: Visualizar vista previa de una boleta antes de emitir
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Boleta"
    //   And tiene una venta válida en el carrito
    //   When hace clic en "Vista previa"
    //   Then el sistema debe mostrar la vista previa del comprobante
    //   And la información de ítems e importes debe corresponder a la venta actual

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("151515");
    await page.getByText("item gravado sin control").click();
    await page.getByText("BOLETA").first().click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1004"]',
        )
        .getByText("BOLETA")
        .click();

    await page.getByRole("button", { name: "VISTA PREVIA" }).click();
    await page.locator(".control > .plus").click();
    await page.locator(".control > .plus").click();
    await page.locator(".control > .plus").click();
    await page.locator(".icon-close").click();
    //Para este caso si se puedo incluso cerrar el modal de vista previa pero debemos ver la forma de tener todo el tiempo el carrito/lista de items con los precios del total y los importes en general para verificar que la vista previa muestre lo mismo que el carrito/lista de items con los precios del total y los importes en general

    // # ==================== FACTURA ====================

    // Scenario: Emitir una factura correctamente con productos con control de stock
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Factura"
    //   And define una fecha dentro de los últimos 3 días
    //   And selecciona un cliente con RUC válido
    //   And tiene una venta válida con productos con control de stock
    //   When confirma la emisión
    //   Then el sistema debe emitir la factura correctamente
    //   And la factura debe visualizarse en la lista de comprobantes
    //   And el comprobante debe estar en estado aceptado por SUNAT
    //   And el stock del producto debe disminuir según la cantidad vendida
    //   And debe registrarse un movimiento de salida en el kardex del producto

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .locator("div")
        .filter({ hasText: /^BOLETA$/ })
        .nth(1)
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]',
        )
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("111111");
    await page.getByText("Item para combos estricto").click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]',
        )
        .fill("50");

    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]',
        )
        .click();

    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-input:fecha"]',
        )
        .click();
    await page.getByRole("button", { name: "domingo, 26 de abr de" }).click();
    await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
    await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, razón" })
        .fill("20759685854");
    await page.getByText("automatizacionerp2 cliente RUC").click();
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "Monto exacto" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248792"]',
        )
        .click();
    await page.getByText("Bitácora").click();
    await page.locator(".drape.is-open > .button-close > .icon").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Stock de productos").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("111111");
    await page.getByText("Varios*").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Kardex total").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("111111");
    await page.getByText("Varios*").click();
    await page.getByRole("button", { name: "Kardex por producto" }).click();
    await page.getByRole("button", { name: "VER DETALLE" }).first().click();
    await page.getByText("M001-S-1743").click();
    await page.getByText("Datos opcionales").click();
    await page.locator(".v-modal > div").first().click();
    const page8Promise = page.waitForEvent("popup");
    await page.getByText("F001-1", { exact: true }).click();
    const page8 = await page8Promise;

    // Scenario: Bloquear emisión de factura con fecha fuera del rango permitido
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Factura"
    //   And define una fecha con más de 3 días de antigüedad
    //   And selecciona un cliente con RUC válido
    //   When intenta confirmar la emisión del comprobante
    //   Then el sistema no debe permitir la emisión
    //   And debe mostrar una validación visible por fecha

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .locator("div")
        .filter({ hasText: /^BOLETA$/ })
        .nth(1)
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]',
        )
        .click();

    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("151515");
    await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, razón" })
        .fill("20759685854");
    await page
        .getByText(
            "RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente",
        )
        .click();
    await page.getByText("item gravado sin control").click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-input:fecha"]',
        )
        .click();
    await page.getByRole("button", { name: "jueves, 23 de abr de" }).click();

    // Scenario: Emitir una factura con descuento por ítem en porcentaje y descuento global por monto exacto
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Factura"
    //   And selecciona un cliente con RUC válido
    //   And tiene una venta válida con al menos dos ítems
    //   And aplica un descuento por ítem en porcentaje a uno de los ítems
    //   And aplica un descuento global por monto exacto a la venta
    //   When confirma la emisión del comprobante
    //   Then el sistema debe emitir la factura correctamente
    //   And la factura debe visualizarse en la lista de comprobantes
    //   And el comprobante debe estar en estado aceptado por SUNAT
    //   And el descuento por ítem debe visualizarse en el comprobante
    //   And el descuento global debe visualizarse en el comprobante

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();

    await page.getByText("BOLETA").first().click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]',
        )
        .click();

    await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, razón" })
        .fill("20759685854");
    await page
        .getByText(
            "RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente",
        )
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("121212");
    await page.getByText("item para combos gravado").click();

    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
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
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]',
        )
        .first()
        .click();
    await page.getByText("%", { exact: true }).click();
    await page.getByText("Porcentaje").click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:descuento"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:descuento"]',
        )
        .fill("15");
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]',
        )
        .first()
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:detalles"]',
        )
        .click();
    await page.getByText("%", { exact: true }).click();
    await page.getByText("Monto").click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_cmp-descuento-pedido_v-input:valor"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_cmp-descuento-pedido_v-input:valor"]',
        )
        .fill("5");
    await page.getByRole("button", { name: "Aplicar descuento" }).click();

    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:totales"]',
        )
        .click();
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "Monto exacto" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByText("F001-").click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();
    await page.locator(".body-options > .cmp-dropdown").first().click();
    await page.getByText("Bitácora").click();
    await page.locator(".drape.is-open > .button-close > .icon").click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248797"]',
        )
        .click();
    const page9Promise = page.waitForEvent("popup");
    await page.getByRole("link", { name: "Ver comprobante" }).click();
    const page9 = await page9Promise;
    await page9.locator("span > .icon").click(); // en realidad no es necesario el click pero si es necesario que el cursosr este ahi porque ahi se abre un modal pequeño donde se muestra todos los descuentos y ahi se debe verificar que se muestre el descuento por ítem del 15% y el descuento global de 5 soles que se aplico a la venta antes de emitir la factura
    //Se veririfica el stock en inventario y kardex
    await page.getByText("Productos y servicios").click();
    await page.getByText("Stock de productos").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByText("Varios*").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Kardex total").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByRole("button", { name: "Kardex por producto" }).click();
    await page.getByRole("button", { name: "VER DETALLE" }).first().click();
    await page.getByText("M001-S-1745").click();
    await page.getByText("Datos opcionales").click();
    await page.locator(".v-modal > div").first().click();

    // Scenario: Bloquear factura sin RUC
    //   Given que el usuario selecciona el tipo de comprobante "Factura"
    //   And selecciona un cliente sin RUC
    //   When intenta emitir
    //   Then el sistema debe bloquear la emisión
    //   And debe mostrar una validación visible

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page.getByText("BOLETA").first().click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]',
        )
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("151515");
    await page.getByText("item gravado sin control").click();

    await page.getByRole("button", { name: "PAGAR" }).click(); // al pagar se espera un await expect.getbytext('Selecciona un cliente con RUC para emitir una factura')
    await page.getByRole("button", { name: "Aceptar" }).click();

    // Scenario: Emitir factura de exportación sin RUC
    //   Given que el usuario configura una operación de exportación
    //   And selecciona el tipo de comprobante "Factura"
    //   And selecciona un cliente permitido sin RUC
    //   When confirma la emisión
    //   Then el sistema debe emitir la factura correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT
    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page.getByText("BOLETA").first().click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]',
        )
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("121212");
    await page.getByText("item para combos gravado").click();
    await page
        .locator(
            "div:nth-child(4) > .switch-component > .v-switch > .switch-content > .switch > .slider",
        )
        .click(); // este switch es de exportacion y al activarlo debe permitir emitir sin Cliente incluso porque el sistema no permite ingresar un cliente sin RUC
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "Monto exacto" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();
    await page.getByText("Ventas y comprasProductos y").click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();

    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248806"]',
        )
        .click();
    await page.getByText("Bitácora").click();
    await page.locator(".drape.is-open > .button-close > .icon").click();

    await page.getByText("Productos y servicios").click();
    await page.getByText("Stock de productos").click();
    await page.locator('[id="cmn_cmp-overload:loading"]').click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByRole("cell", { name: "Varios*" }).click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Kardex total").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
    await page.getByText("Varios*").click();
    await page.getByRole("button", { name: "Kardex por producto" }).click();
    await page.getByRole("button", { name: "VER DETALLE" }).first().click();
    await page.getByText("M001-S-1745").click();
    await page.getByText("Datos opcionales").click();
    await page.locator(".v-modal > div").first().click();

    // Scenario: Emitir una factura con retención
    //   Given que el usuario selecciona el tipo de comprobante "Factura"
    //   And selecciona un cliente con RUC válido
    //   And tiene una venta válida que aplica retención
    //   When confirma la emisión
    //   Then el sistema debe emitir la factura correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page.getByText("BOLETA").first().click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]',
        )
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("121212");
    await page.getByText("item para combos gravado").click();
    await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, razón" })
        .fill("20759685854");
    await page
        .getByText(
            "RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente",
        )
        .click();
    await page
        .locator(
            "div:nth-child(3) > .switch-component > .v-switch > .switch-content > .switch > .slider",
        )
        .click();
    await page.getByRole("textbox").nth(3).click();
    await page.getByRole("textbox").nth(3).fill("18");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await page.locator(".v-modal > div").first().click();
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "IZY PAY" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();
    await page.locator(".body-options > .cmp-dropdown").first().click();
    await page.getByText("Bitácora").click();
    await page.locator(".drape.is-open > .button-close > .icon").click();
    await page.getByText("Productos y servicios").click();
    await page.getByText("Stock de productos").click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, código o c" })
        .fill("121212");
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
        .fill("121212");
    await page.getByText("Varios*").click();
    await page.getByRole("button", { name: "Kardex por producto" }).click();
    await page.getByRole("button", { name: "VER DETALLE" }).nth(1).click();
    await page.getByText("M001-S-1747").click();
    await page.getByText("Datos opcionales").click();
    await page.locator(".v-modal > div").first().click();
    const page10Promise = page.waitForEvent("popup");
    await page.getByText("F001-5").click();
    const page10 = await page10Promise;
    await page10.getByText("ESTE DOCUMENTO ESTA AFECTO A").click(); // para la retencion se podra ver recien ene la ventan ade ver comprobante se pondra un .expect.getbytext('ESTE DOCUMENTO ESTA AFECTO A RETENCION DEL 18%') para verificar que se muestre esa leyenda que indica que se aplico la retencion del 18% a la factura

    // Scenario: Bloquear emisión de factura con detracción sin datos completos
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Factura"
    //   And selecciona un cliente con RUC válido
    //   And tiene una venta válida
    //   And activa la detracción
    //   And no completa todos los campos obligatorios de detracción
    //   When intenta confirmar la emisión del comprobante
    //   Then el sistema no debe permitir la emisión
    //   And debe mostrar una validación visible indicando que faltan datos de detracción

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();

    await page.getByText("BOLETA").first().click();
    await page.getByText("FACTURA", { exact: true }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("151515");
    await page.getByText("item gravado sin control").click();
    await page
        .locator(
            "div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider",
        )
        .click(); // este swtich es de detraccion y al activarlo se deben mostrar campos obligatorios para configurar la detraccion y si no se llenan esos campos el sistema debe bloquear la emision de la factura al intentar emitir  sin llenar los campos de detraccion se puede poner un .expect.getbytext('Completa los datos de detracción para emitir la factura') para verificar que se muestre esa validacion indicando que faltan datos de detraccion
    await page.getByRole("button", { name: "PAGAR" }).click(); // al pagar se pondra un expect.getbytext('El monto de detracción no puede ser cero')
    await page.getByRole("button", { name: "Aceptar" }).click();

    // Scenario: Emitir una factura con detracción tipo transporte de carga
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Factura"
    //   And selecciona un cliente con RUC válido
    //   And tiene una venta válida
    //   When configura detracción con tipo "Operación sujeta a detracción - Servicio de Transporte de Carga"
    //   And confirma la emisión del comprobante
    //   Then el sistema debe emitir la factura correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT
    //   And la detracción debe visualizarse en el comprobante con el tipo seleccionado

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page.getByText("BOLETA").first().click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]',
        )
        .click();

    await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, razón" })
        .fill("20759685854");
    await page
        .getByText(
            "RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente",
        )
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("121212");
    await page.getByText("item para combos gravado").click();
    await page
        .locator(
            "div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider",
        )
        .click();
    await page.getByRole("button", { name: "Editar" }).click();
    await page.getByText("Operación Sujeta a Detracción").first().click();
    await page
        .getByText(
            "Operación Sujeta a Detracción - Servicio de Transporte de Carga",
        )
        .click();
    await page.getByText("Depósito en cuenta").first().click();
    await page.getByText("Giro").click();
    await page
        .locator('[id="pv_punto-venta_drapes:datos-detraccion_v-input:porcentaje"]')
        .click();
    await page
        .locator('[id="pv_punto-venta_drapes:datos-detraccion_v-input:porcentaje"]')
        .fill("25");
    await page
        .locator(
            '[id="pv_punto-venta_drapes:datos-detraccion_v-input:numero-cuenta"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_drapes:datos-detraccion_v-input:numero-cuenta"]',
        )
        .fill("75-848-2174");

    await page
        .locator("div")
        .filter({ hasText: /^Agregar detalle de carga$/ })
        .nth(1)
        .click();
    await page
        .getByRole("textbox", { name: "Ingresa distrito, ciudad o" })
        .first()
        .click();
    await page
        .getByRole("textbox", { name: "Ingresa distrito, ciudad o" })
        .first()
        .fill("arequipa");
    await page.getByText("- Arequipa - Arequipa - Arequipa").click();
    await page
        .getByRole("textbox", { name: "Ingresa dirección de origen" })
        .click();
    await page
        .getByRole("textbox", { name: "Ingresa dirección de origen" })
        .fill("arequipa");
    await page
        .getByRole("textbox", { name: "Ingresa distrito, ciudad o" })
        .click();
    await page
        .getByRole("textbox", { name: "Ingresa distrito, ciudad o" })
        .fill("juliaca");
    await page.getByText("- Juliaca - San Roman - Puno").click();
    await page
        .getByRole("textbox", { name: "Ingresa dirección de destino" })
        .click();
    await page
        .getByRole("textbox", { name: "Ingresa dirección de destino" })
        .fill("arequipa");
    await page
        .locator(
            '[id="pv_punto-venta_drapes:detalle-transporte-carga_v-input:valor-referencial-transporte"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_drapes:detalle-transporte-carga_v-input:valor-referencial-transporte"]',
        )
        .fill("10");
    await page
        .locator(
            '[id="pv_punto-venta_drapes:detalle-transporte-carga_v-input:valor-referencial-carga-efectiva"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_drapes:detalle-transporte-carga_v-input:valor-referencial-carga-efectiva"]',
        )
        .fill("2");
    await page
        .locator(
            '[id="pv_punto-venta_drapes:detalle-transporte-carga_v-input:valor-referencial-carga-util"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_drapes:detalle-transporte-carga_v-input:valor-referencial-carga-util"]',
        )
        .fill("3");
    await page
        .getByRole("textbox", { name: "Ingresa detalle del viaje" })
        .click();
    await page
        .getByRole("textbox", { name: "Ingresa detalle del viaje" })
        .fill("nueva factura detraccion trasnporte carga");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await page.getByRole("button", { name: "Actualizar" }).click();
    await page.locator(".v-modal > div").first().click();
    await page.getByRole("button", { name: "Editar" }).click();
    await page.getByRole("button", { name: "Agregar detalle de carga" }).click();
    await page.getByRole("button", { name: "Agregar tramo y vehículo" }).click();
    await page
        .getByRole("textbox", { name: "Ingresa distrito, ciudad o" })
        .first()
        .click();
    await page
        .getByRole("textbox", { name: "Ingresa distrito, ciudad o" })
        .first()
        .fill("arequipa");
    await page.getByText("- Arequipa - Arequipa - Arequipa").click();
    await page
        .getByRole("textbox", { name: "Ingresa distrito, ciudad o" })
        .click();
    await page
        .getByRole("textbox", { name: "Ingresa distrito, ciudad o" })
        .fill("juliaca");
    await page.getByText("- Juliaca - San Roman - Puno").click();
    await page
        .locator(
            '[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:configuracion-vehicular"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:configuracion-vehicular"]',
        )
        .fill("ninguna");
    await page
        .locator(
            '[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:carga-util-metricas-vehiculo"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:carga-util-metricas-vehiculo"]',
        )
        .fill("1");
    await page
        .locator(
            '[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:carga-efectiva-toneladas-metricas"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:carga-efectiva-toneladas-metricas"]',
        )
        .fill("2.5");
    await page
        .locator(
            '[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:description-tramo"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:description-tramo"]',
        )
        .fill("nuevo tramito automatizado");
    await page.getByRole("textbox", { name: "Ej. S/" }).click();
    await page.getByRole("textbox", { name: "Ej. S/" }).fill("10");
    await page
        .locator(
            '[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:valor-referencial-tonelada-metrica"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:valor-referencial-tonelada-metrica"]',
        )
        .fill("10.5");
    await page
        .locator(
            '[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:valor-preliminar-carga-util-nominal"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_drapes:informacion-tramo-vehiculo_v-input:valor-preliminar-carga-util-nominal"]',
        )
        .fill("22");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await page.getByRole("button", { name: "Actualizar" }).click();
    await page.locator(".v-modal > div").first().click();
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "Monto exacto" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248819"]',
        )
        .click();
    await page.getByText("Bitácora").click();
    await page.locator(".drape.is-open > .button-close > .icon").click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248819"]',
        )
        .click();
    const page11Promise = page.waitForEvent("popup");
    await page.getByRole("link", { name: "Ver comprobante" }).click();
    const page11 = await page11Promise;
    await page11.getByText("OPERACIÓN SUJETA AL SISTEMA").click(); // esto sera un expect.getbytext('OPERACIÓN SUJETA AL SISTEMA DE PAGO DE OBLIGACIONES TRIBUTARIAS...') el texto es mas largo pero suficiente que indique eso ? o lo pongo completo : OPERACIÓN SUJETA AL SISTEMA DE PAGO DE OBLIGACIONES TRIBUTARIAS CON EL GOBIERNO CENTRAL - SERVICIO DE TRANSPORTE DE CARGA. DETRACCIÓN S/. 4 -- 25% (CÓDIGO 027 - Servicio de transporte de carga). CUENTA DE DETRACCIONES 75-848-2174, MEDIO DE PAGO: Giro

    // Scenario: Emitir una factura en moneda distinta a soles con detracción usando tipo de cambio
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Factura"
    //   And selecciona un cliente con RUC válido
    //   And selecciona una moneda distinta a soles
    //   And tiene una venta válida
    //   And configura detracción con un tipo válido
    //   And ingresa un tipo de cambio válido
    //   When confirma la emisión del comprobante
    //   Then el sistema debe emitir la factura correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT
    //   And la detracción debe visualizarse en soles en el comprobante

    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("121212");
    await page.getByText("item para combos gravado").click();

    await page.getByText("BOLETA").first().click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]',
        )
        .click();
    await page.getByRole("textbox", { name: "Buscar por nombre, razón" }).click();
    await page
        .getByRole("textbox", { name: "Buscar por nombre, razón" })
        .fill("20759685854");
    await page
        .getByText(
            "RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente",
        )
        .click();
    await page.getByText("Precio estándar (S/)").first().click();
    await page.getByText("Precio dolares ($)").click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]',
        )
        .fill("150");
    await page
        .locator(
            '[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]',
        )
        .click();

    await page
        .locator(
            "div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider",
        )
        .click();
    await page.getByRole("button", { name: "Editar" }).click();
    await page
        .locator('[id="pv_punto-venta_drapes:datos-detraccion_v-input:porcentaje"]')
        .click();
    await page
        .locator('[id="pv_punto-venta_drapes:datos-detraccion_v-input:porcentaje"]')
        .fill("25");
    await page
        .locator(
            '[id="pv_punto-venta_drapes:datos-detraccion_v-input:numero-cuenta"]',
        )
        .click();
    await page
        .locator(
            '[id="pv_punto-venta_drapes:datos-detraccion_v-input:numero-cuenta"]',
        )
        .fill("75-964-78517");
    await page.getByRole("button", { name: "Actualizar" }).click();
    await page.locator(".v-modal > div").first().click();
    await page.getByRole("textbox", { name: "Cambio" }).click();
    await page.getByRole("textbox", { name: "Cambio" }).fill("3.7");
    await page.getByRole("button", { name: "PAGAR" }).click();
    await page.getByRole("button", { name: "Monto exacto" }).click();
    await page.getByRole("button", { name: "Realizar Pago" }).click();
    await page.getByRole("button", { name: "Nueva Venta" }).click();
    await page.locator(".icon").first().click();
    await page.getByText("Ventas y compras").click();
    await page.getByText("Búsqueda de comprobantes").click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248842"]',
        )
        .click();
    await page.getByText("Bitácora").click();
    await page.locator(".drape.is-open > .button-close > .icon").click();
    await page
        .locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248842"]',
        )
        .click();
    const page12Promise = page.waitForEvent("popup");
    await page.getByRole("link", { name: "Ver comprobante" }).click();
    const page12 = await page12Promise;
    await page12.getByText("OPERACIÓN SUJETA AL SISTEMA").click(); // texto completo : OPERACIÓN SUJETA AL SISTEMA DE PAGO DE OBLIGACIONES TRIBUTARIAS CON EL GOBIERNO CENTRAL. DETRACCIÓN S/. 138.75 -- 25% (CÓDIGO 022 - Otros servicios empresariales). CUENTA DE DETRACCIONES 75-964-78517, MEDIO DE PAGO: Depósito en cuenta 


    // Scenario: Bloquear emisión de factura en moneda distinta a soles con detracción sin tipo de cambio
    //   Given que el usuario selecciona el tipo de comprobante "Factura"
    //   And selecciona un cliente con RUC válido
    //   And selecciona una moneda distinta a soles
    //   And tiene una venta válida
    //   And configura detracción
    //   And no ingresa tipo de cambio
    //   When intenta emitir el comprobante
    //   Then el sistema debe bloquear la emisión
    //   And debe mostrar una validación indicando que el tipo de cambio es obligatorio


    await page.getByText('Ventas y compras').click();
    await page.getByText('Nueva venta').click();
    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('121212');
    await page.getByText('item para combos gravado').click();
    await page.getByText('Precio estándar (S/)').first().click();
    await page.getByText('Precio dolares ($)').click();
    await page.getByText('BOLETA').first().click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).fill('20759685854');
    await page.getByText('RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente').click();
    await page.locator('div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider').click();
    await page.getByRole('button', { name: 'Editar' }).click();
    await page.locator('[id="pv_punto-venta_drapes:datos-detraccion_v-input:porcentaje"]').click();
    await page.locator('[id="pv_punto-venta_drapes:datos-detraccion_v-input:porcentaje"]').fill('025');
    await page.locator('[id="pv_punto-venta_drapes:datos-detraccion_v-input:numero-cuenta"]').click();
    await page.locator('[id="pv_punto-venta_drapes:datos-detraccion_v-input:numero-cuenta"]').fill('45-284-71523');
    await page.getByRole('button', { name: 'Actualizar' }).click();
    await page.locator('.v-modal > div').first().click();
    await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]').click();
    await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]').click();
    await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]').fill('150');
    await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]').click();
    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByText('Falta tipo de cambio en').click(); //eso sera un expect no un click
    await page.getByRole('button', { name: 'Aceptar' }).click();

    // Scenario: Emitir una factura de adelanto
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Factura"
    //   And activa el switch "Adelanto"
    //   And define una fecha de emisión dentro de los últimos 3 días
    //   And selecciona un cliente con RUC válido
    //   And ingresa un monto válido para adelanto
    //   When confirma la emisión del comprobante
    //   Then el sistema debe emitir la factura como adelanto correctamente
    //   And la factura debe visualizarse en la lista de comprobantes
    //   And el comprobante debe estar en estado aceptado por SUNAT
    //   And no debe generarse ningún movimiento de salida de stock
    //   And no debe registrarse ningún movimiento en el kardex


    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.getByText('BOLETA').first().click();
    await page.getByText('FACTURA', { exact: true }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('121212');
    await page.getByText("item para combos gravado").click();
    await page.locator('.slider').first().click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-input:fecha"]').click();
    await page.getByRole('button', { name: 'sábado, 25 de abr de' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).fill('20759685854');

    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByRole('button', { name: 'PLIN' }).click();
    await page.getByRole('button', { name: 'Realizar Pago' }).click();
    await page.getByRole('button', { name: 'Nueva Venta' }).click();
    await page.locator('.icon').first().click();
    await page.getByText('Ventas y compras').click();
    await page.getByText('Búsqueda de comprobantes').click();
    await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248862"]').click();
    await page.getByText('Bitácora').click();
    await page.locator('.drape.is-open > .button-close').click();

    await page.locator('.v-icon-base > .icon').first().click();
    const page13Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Ver comprobante' }).click();
    const page13 = await page13Promise;
    await page13.getByText('Factura de adelanto').click(); // esto sera un expect para ver que el comprobante se llama asi Factura de adelanto y que se muestre esa leyenda en el comprobante para verificar que se emitio como factura de adelanto

    // Scenario: Emitir una factura con adelanto aplicado   (Y creo que para esto se crear un adelanto primero luego ya usarlo)
    //   Given que el usuario selecciona el tipo de comprobante "Factura"
    //   And selecciona un cliente con RUC válido
    //   And existe un adelanto disponible
    //   And tiene una venta válida
    //   When aplica el adelanto
    //   And confirma la emisión
    //   Then el sistema debe emitir la factura correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT

    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.getByText('BOLETA').first().click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]').click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
    await page.getByText('item gravado sin control').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).fill('20759685854');
    await page.getByText('RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente').click();
    await page.locator('.slider').first().click();
    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByRole('button', { name: 'Monto exacto' }).click();
    await page.getByRole('button', { name: 'Realizar Pago' }).click(); // Aqui que se guarde el correlativo de esa factura y aparece una vez padado en el modal que luego damos lcick en Nueva Venta ejemplo : F001-9 
    await page.getByRole('button', { name: 'Nueva Venta' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
    await page.getByText('BOLETA').first().click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).fill('20759685854');
    await page.getByText('RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente').click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('121212');
    await page.getByText('Pitem para combos gravado flexible121212').click();
    await page.locator('.slider').first().click();
    await page.getByRole('button', { name: 'Adelantos' }).click();
    // aqui buscamos el correlativo con su serie

    await page.locator('[id="_div:dropdown"]').getByText('Serie').click();
    await page.locator('[id="pv_punto-venta_cmp_venta_pedido:modals_cmp-gestion-adelantos_div:opcion-serie-0"]').getByText('F001').click();
    await page.getByRole('textbox', { name: 'Correlativo' }).click();
    await page.getByRole('textbox', { name: 'Correlativo' }).press('CapsLock');
    await page.getByRole("textbox", { name: "Correlativo" }).fill("9");
    await page.locator('.v-checkbox-default-label.flex-row-align-items-center-justify-content-center > span').first().click();
    await page.locator('.v-modal > div').first().click();
    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByRole('button', { name: 'Monto exacto' }).click();
    await page.getByRole('button', { name: 'Realizar Pago' }).click();

    await page.getByRole('button', { name: 'Nueva Venta' }).click();
    await page.locator('.icon').first().click();
    await page.getByText('Ventas y compras').click();
    await page.locator('div').filter({ hasText: /^Búsqueda de comprobantes$/ }).nth(1).click();
    await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248879"]').click();
    await page.getByText('Bitácora').click();
    await page.locator('.drape.is-open > .button-close > .icon').click();
    await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248879"]').click();
    const page14Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Ver comprobante' }).click();
    const page14 = await page14Promise;

    await page14.locator('.cmp-ver-comprobante-aplicado > .cmp-ver-comprobante-card > .card-container > .v-card > .v-card-heading > .icon-container > .card-icon-handler').click(); // esto es un card que despleiga los fatos de el documento que se aplico como adelanto donde mostrar el serie y el correlativo que era F001-9 para verificar que se aplico correctamente el adelanto a esa factura

    // Scenario: Emitir una factura con ítem afecto a ISC
    //   Given que el usuario selecciona el tipo de comprobante "Factura"
    //   And tiene una venta válida con un ítem afecto a ISC
    //   When confirma la emisión
    //   Then el sistema debe emitir la factura correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT

    await page.goto('https://erpperu2-crt.smartclic.pe/auth/login');
    await page.getByText("Ventas y compras").click();
    await page.getByText("Nueva venta", { exact: true }).click();
    await page.getByRole("button", { name: "Continuar vendiendo" }).click();
    await page.getByText("BOLETA").first().click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]',
        )
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("112211");
    await page.getByText("Producto con ISC fijo 27-4-").click();

    await page1.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:totales"]').click();
    await page1.getByText('ISC1.50').click();// esto sera un expect para que se vea el ISC que es 1.50 en el resumen de la venta para verificar que se aplico correctamente el ISC a ese ítem
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).fill('20759685854');
    await page.getByText('RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente').click();
    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByRole('button', { name: 'Monto exacto' }).click();
    await page.getByRole('button', { name: 'Realizar Pago' }).click();
    await page.getByRole('button', { name: 'Nueva Venta' }).click();
    await page.locator('.icon').first().click();
    await page.getByText('Ventas y compras').click();
    await page.getByText('Búsqueda de comprobantes').click();
    await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248915"]').click();
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Ver comprobante' }).click();
    const page1 = await page1Promise;
    await page1.locator('.v-icon-head-plus > .icon').click();
    await page1.locator('div:nth-child(9) > .text-container').click();
    await page1.locator('div:nth-child(9) > .text-container > div > .v-checkbox > .v-checkbox-base > .v-checkbox-grid-label > span').click();// es un checkbox que nuestra varias opciones adicionales de comprombante pero se elige el que es de ISC
    await page1.getByRole('button', { name: 'Guardar cambios' }).click();
    await page1.getByText('1.50', { exact: true }).click(); // esto sera un expect para ver que esa olumna de ISC tenga el 1.50 que es el ISC

    // Scenario: Emitir una factura con ítem afecto a ICBPER
    //   Given que el usuario selecciona el tipo de comprobante "Factura"
    //   And tiene una venta válida con un ítem afecto a ICBPER
    //   When confirma la emisión
    //   Then el sistema debe emitir la factura correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT
    await page.getByText('Ventas y compras').click();
    await page.getByText('Nueva venta').click();
    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.locator('div').filter({ hasText: /^BOLETA$/ }).nth(1).click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).fill('20759685854');
    await page.getByText('RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente').click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("221122");
    await page.getByText("Producto con ICBPER 27-4-").click();

    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:totales"]').click();
    await page.getByText('ICBPER0.50').click();// est no sera un click sino un expect para ver que esto esxite que es 0.50
    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByRole('button', { name: 'Monto exacto' }).click();
    await page.getByRole('button', { name: 'Realizar Pago' }).click();
    await page.getByRole('button', { name: 'Nueva Venta' }).click();
    await page.locator('.icon').first().click();
    await page.getByText('Ventas y compras').click();
    await page.getByText('Búsqueda de comprobantes').click();
    await page.locator('.v-icon-base > .icon').first().click();
    await page.getByText('Bitácora').click();
    await page.locator('.drape.is-open > .button-close > .icon').click();
    await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248919"]').click();
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Ver comprobante' }).click();
    const page1 = await page1Promise;
    await page1.locator('span > .icon').click();// igual pasamo por este div que no es un botono ni se activa con unclick solo con pasar el cursor por ahi y se muestra esto 
    await page1.getByText('0.50', { exact: true }).click();
    await page1.locator('.montos-total-info-details-content').click();

    // Scenario: Emitir una factura con receta con control de stock
    //   Given que el usuario selecciona el tipo de comprobante "Factura"
    //   And selecciona un cliente con RUC válido
    //   And tiene una venta válida con una receta cuyos componentes manejan stock
    //   When confirma la emisión
    //   Then el sistema debe emitir la factura correctamente
    //   And el comprobante debe estar en estado aceptado por SUNAT
    //   And debe disminuir el stock de cada componente de la receta
    //   And debe registrarse un movimiento en el kardex por cada componente

    await page.getByText('Ventas y compras').click();
    await page.getByText('Nueva venta').click();
    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.getByText('BOLETA').first().click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]').click();

    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).fill('20759685854');
    await page.getByText('RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente').click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page.getByText('Receta insumos estrictos 27-4').click();

    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByRole('button', { name: 'Monto exacto' }).click();
    await page.getByRole('button', { name: 'Realizar Pago' }).click();
    await page.getByRole('button', { name: 'Nueva Venta' }).click();
    await page.locator('.icon').first().click();
    await page.getByText('Ventas y compras').click();
    await page.getByText('Búsqueda de comprobantes').click();
    await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248920"]').click();
    await page.getByText('Bitácora').click();
    await page.locator('.drape.is-open > .button-close > .icon').click();

    await page.getByText('Productos y servicios').click();
    await page.getByText('Stock de productos').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('464646');
    await page.getByText('Varios*').click();
    await page.getByText('Productos y servicios').click();
    await page.getByText('Kardex total').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('464646');
    await page.getByText('Varios*').click();
    await page.getByRole('button', { name: 'Kardex por producto' }).click();
    await page.getByRole('button', { name: 'VER DETALLE' }).first().click();
    await page.getByText('M001-S-').click();
    await page.getByText('Datos opcionales').click();
    await page.locator('.v-modal > div').first().click();


    // Scenario: Visualizar precuenta de una factura antes de emitir
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Factura"
    //   And selecciona un cliente con RUC válido
    //   And tiene una venta válida en el carrito
    //   When hace clic en "Precuenta" ticket
    //   Then el sistema debe mostrar la precuenta de la operación
    //   And la información de ítems e importes debe corresponder a la venta actual


    await page.getByText('Ventas y compras').click();
    await page.getByText('Nueva venta').click();
    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.getByText('BOLETA').first().click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-1003"]').click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
    await page.getByText('item gravado sin control').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, razón' }).fill('20759685854');
    await page.getByText('RUCReg. Único de Contribuyentes2075968585499999999automatizacionerp2 cliente').click();
    await page.getByRole('button', { name: 'PRECUENTA' }).click();

    // # ==================== NOTA DE VENTA ==================== Aqui notas de venta no llegan a SUNAT asi que no se valida eso

    // Scenario: Emitir una nota de venta con productos con control de stock
    //   Given que el usuario selecciona el tipo de comprobante "Nota de venta"
    //   And tiene una venta válida con productos con control de stock
    //   When confirma la emisión
    //   Then el sistema debe emitir la nota de venta correctamente
    //   And la nota de venta debe visualizarse en la lista de comprobantes
    //   And el stock del producto debe disminuir según la cantidad vendida
    //   And debe registrarse un movimiento en el kardex



    await page.getByText('Ventas y compras').click();
    await page.getByText('Nueva venta').click();
    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.getByText('BOLETA').first().click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2016"]').click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('121212');
    await page.getByText('item para combos gravado').click();
    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByRole('button', { name: 'Monto exacto' }).click();
    await page.getByRole('button', { name: 'Realizar Pago' }).click();
    await page.getByRole('button', { name: 'Nueva Venta' }).click();
    await page.locator('.icon').first().click();
    await page.getByText('Ventas y compras').click();
    await page.getByText('Búsqueda de comprobantes').click();
    await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3248922"]').click();
    await page.getByText('Bitácora').click();
    await page.getByText('Productos y servicios').click();
    await page.getByText('Stock de productos').click();
    await page.locator('[id="cmn_cmp-overload:loading"]').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('121212');
    await page.getByText('Varios*').click();
    await page.getByText('Productos y servicios').click();
    await page.getByText('Kardex total').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('121212');
    await page.getByText('Varios*').click();
    await page.getByRole('button', { name: 'Kardex por producto' }).click();
    await page.getByRole('button', { name: 'VER DETALLE' }).nth(1).click();
    await page.getByText('M001-S-1761').click();
    await page.getByText('Datos opcionales').click();
    await page.locator('.v-modal > div').first().click();
    const page2Promise = page.waitForEvent('popup');
    await page.getByText('NV01-').click();
    const page2 = await page2Promise;

    // Scenario: Emitir una nota de venta con descuento global monto
    //   Given que el usuario selecciona el tipo de comprobante "Nota de venta"
    //   And tiene una venta válida
    //   And aplica un descuento global por monto
    //   When confirma la emisión
    //   Then el sistema debe emitir la nota de venta correctamente


    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.getByText("BOLETA").first().click();
    await page
        .locator(
            '[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2016"]',
        )
        .click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
    await page.getByText('item gravado sin control').click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:detalles"]').click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_cmp-descuento-pedido_v-input:valor"]').click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_cmp-descuento-pedido_v-input:valor"]').fill('25');
    await page.getByRole('button', { name: 'Aplicar descuento' }).click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-footer_v-icon:totales"]').click();
    await page.getByText('Total descuento global2.56').click(); // esto sera un expect para verificar que exista el descuento global de 2.56 que se aplico a esa venta
    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByRole('button', { name: 'Monto exacto' }).click();
    await page.getByRole('button', { name: 'Realizar Pago' }).click();
    await page.getByRole('button', { name: 'Nueva Venta' }).click();
    await page.locator('.icon').first().click();
    await page.getByText('Ventas y compras').click();
    await page.getByText('Búsqueda de comprobantes').click();

    // Scenario: Emitir una nota de venta con lista de productos con control de stock
    //   Given que el usuario selecciona el tipo de comprobante "Nota de venta"
    //   And tiene una venta válida con una lista de productos cuyos ítems manejan stock
    //   When confirma la emisión
    //   Then el sistema debe emitir la nota de venta correctamente
    //   And debe disminuir el stock de cada producto de la lista
    //   And debe registrarse un movimiento en el kardex por cada producto

    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.getByText('BOLETA').first().click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2016"]').click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('443444');
    await page.getByText('Lista items flexibles 27-4-').click(); // Como los demas usaran lo que ellos crearan la seleccion despues de la busqueda que sea por Las primeras palabras y el 27-4 o otrofecha que quede como variable segun la fecha de creacion que ellso hagan
    await page.locator('[id="_div:increase"]').first().click();
    await page.getByRole('button', { name: 'Agregar a venta' }).click();
    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByRole('button', { name: 'Monto exacto' }).click();
    await page.getByRole('button', { name: 'Realizar Pago' }).click();
    await page.getByRole('button', { name: 'Nueva Venta' }).click();
    await page.locator('.icon').first().click();
    await page.getByText('Productos y servicios').click();
    await page.locator('div').filter({ hasText: /^Stock de productos$/ }).click();

    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('121212');
    await page.getByText('Varios*').click();
    await page.getByText('Productos y servicios').click();
    await page.getByText('Kardex total').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('121212');
    await page.getByText('Varios*').click();
    await page.getByRole('button', { name: 'Kardex por producto' }).click();

    // Scenario: Emitir una nota de venta con equivalencia
    //   Given que el usuario selecciona el tipo de comprobante "Nota de venta"
    //   And tiene una venta válida con un ítem con equivalencia
    //   When confirma la emisión
    //   Then el sistema debe emitir la nota de venta correctamente
    //   And el stock debe disminuir según el factor de equivalencia
    //   And debe registrarse un movimiento en el kardex

    await page.getByText('Ventas y compras').click();
    await page.getByText('Nueva venta', { exact: true }).click();
    await page.goto('https://erpperu2-crt-2.smartclic.pe/punto-venta/cajas');
    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.getByText('BOLETA').first().click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2016"]').click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .click();
    await page
        .getByRole("textbox", { name: "Escanea o busca por nombre, c" })
        .fill("202020");
    await page.getByText('item equivalente flexible').click();
    await page.getByText('Equivalente X2').click();
    await page.getByText('Equivalencia X6').click();
    await page.locator('.cmp-informacion-item > div').first().click();
    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByRole('button', { name: 'Monto exacto' }).click();
    await page.getByRole('button', { name: 'Realizar Pago' }).click();
    await page.getByRole('button', { name: 'Nueva Venta' }).click();
    await page.locator('.icon').first().click();
    await page.getByText('Ventas y compras').click();
    await page.locator('div').filter({ hasText: /^Búsqueda de comprobantes$/ }).nth(1).click();
    await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3249402"]').click();
    await page.getByText('Bitácora').click();
    await page.locator('.drape.is-open > .button-close > .icon').click();
    await page.getByText('Productos y servicios').click();
    await page.getByText('Stock de productos').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('121212');
    await page.getByText('Varios*').click();
    await page.getByText('Productos y servicios').click();
    await page.getByText('Kardex total').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('202020');
    await page.getByRole('button', { name: 'Kardex por producto' }).click();
    await page.getByRole('button', { name: 'VER DETALLE' }).nth(1).click();
    await page.getByText('M001-S-').first().click();
    await page.getByText('Datos opcionales').click();
    await page.locator('.v-modal > div').first().click();
    const page1Promise = page.waitForEvent('popup');
    await page.getByText('NV01-').first().click();
    const page1 = await page1Promise;


    // Scenario: Emitir una nota de venta de adelanto 
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Nota de venta"
    //   And activa el switch "Adelanto"
    //   And ingresa un monto válido para adelanto
    //   When confirma la emisión del comprobante
    //   Then el sistema debe emitir la nota de venta como adelanto correctamente
    //   And la nota de venta debe visualizarse en la lista de comprobantes
    //   And no debe generarse ningún movimiento de salida de stock
    //   And no debe registrarse ningún movimiento en el kardex

    await page.getByText('Ventas y compras').click();
    await page.locator('div').filter({ hasText: /^Nueva venta$/ }).click();
    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('111111');
    await page.getByText('Item para combos estricto').click();
    await page.getByText('BOLETA').first().click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2016"]').click();
    await page.locator('div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider').click();
    await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]').click();
    await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]').click();
    await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-input:preciofinal"]').fill('150');
    await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-body:acciones_dv:btn-editar"]').click();
    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByRole('button', { name: 'YAPE' }).click();
    await page.getByRole('button', { name: 'Realizar Pago' }).click();
    await page.getByRole('button', { name: 'Nueva Venta' }).click();
    await page.locator('.icon').first().click();
    await page.getByText('Ventas y compras').click();
    await page.getByText('Búsqueda de comprobantes').click();
    await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3249405"]').click();
    await page.getByText('Bitácora').click();
    await page.getByText('Productos y servicios').click();

    await page.getByText('Productos y servicios').click();
    await page.getByText('Stock de productos').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('111111');
    await page.getByText('Varios*').click();
    await page.getByText('Productos y servicios').click();
    await page.getByText('Kardex total').click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).click();
    await page.getByRole('textbox', { name: 'Buscar por nombre, código o c' }).fill('111111');
    await page.getByText('Varios*').click();

    // Scenario: Emitir una nota de venta aplicando un adelanto existente : : Para este tes para usar el adelanto se creara como precondicion:
    //   Given que el usuario se encuentra dentro de una caja abierta
    //   And selecciona el tipo de comprobante "Nota de venta"
    //   And existe un adelanto disponible para el cliente
    //   And tiene una venta válida
    //   When aplica el adelanto a la operación
    //   And confirma la emisión del comprobante
    //   Then el sistema debe emitir la nota de venta correctamente
    //   And la nota de venta debe visualizarse en la lista de comprobantes

    await page.getByText('Ventas y compras').click();
    await page.getByText('Nueva venta').click();
    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.getByText('BOLETA').first().click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2016"]').click();
    await page.locator('div:nth-child(2) > .switch-component > .v-switch > .switch-content > .switch > .slider').click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('151515');
    await page.getByText('item gravado sin control').click();
    await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad"]').click();
    await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad"]').fill('1');
    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByRole('button', { name: 'Monto exacto' }).click();
    await page.getByRole('button', { name: 'Realizar Pago' }).click();
    await page.getByRole('button', { name: 'Nueva Venta' }).click();
    await page.locator('.icon').first().click();
    await page.getByText('Ventas y compras').click();
    await page.getByText('Búsqueda de comprobantes').click();

    await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3249403"]').click();
    await page.getByText('Bitácora').click();
    await page.locator('.drape.is-open > .button-close > .icon').click();
    await page.getByText('Ventas y compras').click();
    await page.getByText('Nueva venta').click();
    await page.getByRole('button', { name: 'Continuar vendiendo' }).click();
    await page.getByText('BOLETA').first().click();
    await page.locator('[id="pv_punto-venta_cmp-venta-pedido_cmp-pedido-header_v-select:tipo-comprobante_v-option:opcion-2016"]').click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).click();
    await page.getByRole('textbox', { name: 'Escanea o busca por nombre, c' }).fill('121212');
    await page.getByText('item para combos gravado').click();
    await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad"]').click();
    await page.locator('[id="pv_cmp-punto-venta_cmp-venta-pedido:pedido_cmp-pedido-item:item_v-step:cantidad"]').fill('3');
    await page.getByRole('button', { name: 'Adelantos' }).click();
    await page.locator('.v-checkbox-default-label.flex-row-align-items-center-justify-content-center > span').first().click();
    await page.locator('.v-modal > div').first().click();
    await page.getByText('Total anticipos').click(); // esto sera un expect para verificar que el adelanto que se aplico a esa nota de venta es el mismo que se creo en la precondicion y se muestra en el resumen de la venta

    await page.getByRole('button', { name: 'PAGAR' }).click();
    await page.getByRole('button', { name: 'Monto exacto' }).click();
    await page.getByRole('button', { name: 'Realizar Pago' }).click();
    await page.getByRole('button', { name: 'Nueva Venta' }).click();
    await page.locator('.icon').first().click();
    await page.getByText('Ventas y compras').click();
    await page.locator('div').filter({ hasText: /^Búsqueda de comprobantes$/ }).nth(1).click();
    await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3249404"]').click();
    await page.getByText('Bitácora').click();
    await page.locator('.drape.is-open > .button-close > .icon').click();
    await page.locator('[id="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:3249404"]').click();
    const page2Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Ver comprobante' }).click();
    const page2 = await page2Promise;
    await page2.getByText('Adelantos aplicados').nth(1).click(); // Esto solo es para verificar que el adelanto que se aplico a esa nota de venta es el mismo que se creo en la precondicion y se muestra en la vista del comprobante como adelanto aplicado
    await page2.locator('.card-container.center > .v-card > .v-card-heading > .icon-container > .card-icon-handler').click();
});