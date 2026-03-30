import {test, expect, Page} from "@playwright/test";

test.describe("Crear items avanzados", () => {
  test.describe.configure({ mode: "parallel" });
// Al inicio del archivo o en un helpers.ts
  async function waitForOverlay(page: Page, timeout = 30000) {
    await page.locator('#cmn_cmp-overload\\:loading').waitFor({
      state: 'hidden',
      timeout
    });
  }
  test("Crear item estricto gravado con variante", async ({ page }) => {
    test.setTimeout(120000) // Tiempo exacto para que se cree todo este item;
    const timestamp = Date.now(); // Ej: 1711704500123
    const nombreProducto = `Item automatizado gravado estricto ${timestamp}`;

    await page.goto('/');
    await waitForOverlay(page);
    await expect(page.getByText("Productos y servicios")).toBeVisible();
    await page.getByText("Productos y servicios").click();

    await page.locator("div").filter({ hasText: /^Búsqueda de ítems$/ }).nth(2).click();
    await page
      .locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]')
      .click();
    await page.getByText("PNuevo producto").click();
    await page
      .locator("div")
      .filter({ hasText: /^Opciones avanzadas \(opcional\)$/ })
      .click();
    await page
      .getByRole("textbox", { name: "Ej. Gaseosa Kola R (500ml)" })
      .click();
    await page
      .getByRole("textbox", { name: "Ej. Gaseosa Kola R (500ml)" })
      .fill(nombreProducto);
    await page.getByRole("textbox", { name: "Monto final" }).click();
    await page.getByRole("textbox", { name: "Monto final" }).fill("10");
    await page
      .locator(
        '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]',
      )
      .nth(1)
      .click();
    await page
      .locator(
        '[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto"]',
      )
      .click();
    // cards de los almacenes:
    const cardJhunior = page.locator(".cmp-card-almacen").filter({
      has: page.getByText("JHUNIOR", { exact: true }),
    });

    const inputCantidad = cardJhunior.locator(
        'input[id="lgt_cmp-card-almacen_v-step:cantidad"]',
    );

    await expect(cardJhunior).toHaveCount(1);
    await expect(inputCantidad).toHaveCount(1);

    await inputCantidad.fill("100");
    console.log("Agregando stock a los almacenes")

    await page.getByText("Campos adicionales(Opcional)").click();
    await page
      .locator(
        '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-5"]',
      )
      .nth(5)
      .click();
    await page.getByText("Añadir una nueva variante").click();
    await page.getByText("Añadir una nueva variante").click();
    await page.getByText("Añadir una nueva variante").click();
    console.log("Agregando 3 variantes")
    await page
      .locator(
        "div:nth-child(2) > div > .card > .content-card > div:nth-child(2) > div > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form",
      )
      .first()
      .click();
    await page.locator("div").filter({ hasText: /^Hp$/ }).nth(1).click();
    await page
      .locator(
        "div:nth-child(2) > div > .card > .content-card > div:nth-child(2) > div:nth-child(2) > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form",
      )
      .click();
    await page.getByText("16 GB").nth(1).click();
    await page
      .locator(
        "div:nth-child(2) > div > .card > .content-card > div:nth-child(2) > div:nth-child(3) > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form",
      )
      .click();
    await page.getByText("128 GB").nth(1).click();
    await page
      .locator(
        "div:nth-child(3) > div > .card > .content-card > div:nth-child(2) > div > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form",
      )
      .first()
      .click();
    await page.getByText("Apple").nth(2).click();
    await page
      .locator(
        "div:nth-child(3) > div > .card > .content-card > div:nth-child(2) > div:nth-child(2) > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form",
      )
      .click();
    await page.getByText("32 GB").nth(2).click();
    await page
      .locator(
        "div:nth-child(3) > div > .card > .content-card > div:nth-child(2) > div:nth-child(3) > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form",
      )
      .click();
    await page
      .locator("div")
      .filter({ hasText: /^500 GB$/ })
      .nth(2)
      .click();
    await page
      .locator('[id="lgt_reg-item_v-tab:variantes-item_cmp-dropdown:opciones"]')
      .first()
      .click();
    await page.getByText("Administrar stock de esta").first().click();
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .first()
      .click();
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .first()
      .fill("100");
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .nth(1)
      .click();
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .nth(1)
      .fill("100");
    await page.getByRole("button", { name: "Guardar stock" }).click();
    await page
      .locator('[id="lgt_reg-item_v-tab:variantes-item_cmp-dropdown:opciones"]')
      .nth(1)
      .click();
    await page.getByText("Administrar stock de esta").nth(1).click();
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .first()
      .click();
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .first()
      .fill("100");
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .nth(1)
      .click();
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .nth(1)
      .fill("100");
    await page.getByRole("button", { name: "Guardar stock" }).click();
    await page
      .locator('[id="lgt_reg-item_v-tab:variantes-item_cmp-dropdown:opciones"]')
      .nth(2)
      .click();
    await page.getByText("Administrar stock de esta").nth(2).click();
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .first()
      .click();
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .first()
      .fill("100");
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .nth(1)
      .click();
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .nth(1)
      .fill("100");
    await page.getByRole("button", { name: "Guardar stock" }).click();

    await page.getByRole("button", { name: "Crear producto" }).click();

    console.log(`Producto creado con éxito: ${nombreProducto}`);

    await page.getByRole("button", { name: "Ir a lista de ítems" }).click({timeout:10000});
    console.log("Redirigido a lista de ítems");
    await waitForOverlay(page);
    await page
      .locator(
        ".flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle",
      )
      .first()
      .click();
    console.log(`Haciendo click en las acciones de ${nombreProducto}`)
    await page
      .locator(
        '[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]',
      )
      .click();
    console.log("Ver item")
    await waitForOverlay(page)
    // Esperar a que el overlay se oculte

    await page
      .locator(
        '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:ventas"]',
      )
      .click();
    console.log("Viendo ventas del item")
    await waitForOverlay(page);
    await page
      .locator(
        '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:compras"]',
      )
      .click({timeout:10000});
    console.log("Viendo compras")
    await waitForOverlay(page);
    await page
      .locator(
        '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]',
      )
      .click();
    console.log("Viendo bitacora")
    await waitForOverlay(page);

    await page.getByRole("button", { name: "Atrás" }).click();
    await page
      .locator(
        ".flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle",
      )
      .first()
      .click();
    console.log("Completada volviendo a lista de items")
  });

  test("Crear item estricto gravado con equivalente", async ({ page }) => {
    test.setTimeout(120000);

    const timestamp= Date.now();
    const nombreItem = `item gravado estricto equivalente ${timestamp}`;

    await page.goto('/');

    await waitForOverlay(page);
    await expect(page.getByText("Productos y servicios")).toBeVisible();
    await page.getByText("Productos y servicios").click();

    await page.locator("div").filter({ hasText: /^Búsqueda de ítems$/ }).nth(2).click();
    await page
        .locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]')
        .click();
    await page.getByText("PNuevo producto").click();
    await page
        .locator("div")
        .filter({ hasText: /^Opciones avanzadas \(opcional\)$/ })
        .click();
    await page
        .getByRole("textbox", { name: "Ej. Gaseosa Kola R (500ml)" })
        .fill(nombreItem);
    await page.getByRole("textbox", { name: "Monto final" }).click();
    await page.getByRole("textbox", { name: "Monto final" }).fill("10");
    await page
        .locator(
            '[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]',
        )
        .nth(1)
        .click();
    await page
        .locator(
            '[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto"]',
        )
        .click();
    // cards de los almacenes:
    const cardJhunior = page.locator(".cmp-card-almacen").filter({
      has: page.getByText("JHUNIOR", { exact: true }),
    });

    const inputCantidad = cardJhunior.locator(
        'input[id="lgt_cmp-card-almacen_v-step:cantidad"]',
    );

    await expect(cardJhunior).toHaveCount(1);
    await expect(inputCantidad).toHaveCount(1);

    await inputCantidad.fill("100");
    console.log("Agregando stock a los almacenes")


    await page.getByText("Equivalencias(Opcional)").click();
    await waitForOverlay(page);
    console.log("Modulo de creacion de equovalencias pasado")
    await page.getByText('AQUÍ').click();
    console.log("Presionado AQUI")
    await waitForOverlay(page);

    //Creacion del primer equi
    await page.getByRole('textbox', { name: 'Digita el nombre de la' }).fill('Equivalente X2');
    console.log("Ingresando el nombre de la equivalencia")
    await page.locator('div').filter({ hasText: /^Seleccionar$/ }).nth(2).click();
    console.log("click en el tipo de tipo de afectacion")
    await page.locator('div').filter({ hasText: /^Gravado \(Paga IGV 18%\)$/ }).first().click();
    console.log("Tipo de afectacion seleccionado")
    await page.locator('[id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad_div:increase"]').click();
    await page.locator('[id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad_div:increase"]').click();
    console.log("click en factor multiplicador")
    await page.getByRole('textbox', { name: 'precio base' }).click();
    await page.getByRole('textbox', { name: 'precio base' }).fill('11');
    console.log("ingresando precio")
    await page.getByRole('button', { name: 'Crear Equivalencia' }).click();
    console.log("Creando primer equivalente")

    await waitForOverlay(page);

    await page.getByRole('button', { name: 'Agregar equivalencia' }).click();
    console.log("Creando la segunda equivalencia")
    await page.getByRole('textbox', { name: 'Digita el nombre de la' }).click();

    await page.getByRole('textbox', { name: 'Digita el nombre de la' }).fill('equivalente X3');
    console.log("Ingresando el nombre de la equivalencia")

    await page.locator('div').filter({ hasText: /^Seleccionar$/ }).nth(2).click();
    await page.locator('div').filter({ hasText: /^Gravado \(Paga IGV 18%\)$/ }).first().click();
    await page.locator('[id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad_div:increase"]').click();
    await page.locator('[id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad_div:increase"]').click();
    await page.locator('[id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad_div:increase"]').click();
    await page.getByRole('textbox', { name: 'precio base' }).click();
    await page.getByRole('textbox', { name: 'Monto final' }).click();
    await page.getByRole('textbox', { name: 'Monto final' }).fill('10');

    await page.getByRole('button', { name: 'Crear Equivalencia' }).click();

    await page.locator('[id="lgt_reg-item_v-button:aceptar-registro-item"]').click();
    console.log(`Producto creado con éxito: ${nombreItem}`);
    await page.getByRole("button", { name: "Ir a lista de ítems" }).click({timeout:10000});
    console.log("Redirigido a lista de ítems");
    await waitForOverlay(page);
    await page
        .locator(
            ".flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle",
        )
        .first()
        .click();
    console.log(`Haciendo click en las acciones de ${nombreItem}`)
    await page
        .locator(
            '[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]',
        )
        .click();
    console.log("Ver item")
    await waitForOverlay(page)
    // Esperar a que el overlay se oculte

    await page
        .locator(
            '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:ventas"]',
        )
        .click();
    console.log("Viendo ventas del item")
    await waitForOverlay(page);
    await page
        .locator(
            '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:compras"]',
        )
        .click({timeout:10000});
    console.log("Viendo compras")
    await waitForOverlay(page);
    await page
        .locator(
            '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]',
        )
        .click();
    console.log("Viendo bitacora")
    await waitForOverlay(page);

    await page.getByRole("button", { name: "Atrás" }).click();
    await page
        .locator(
            ".flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle",
        )
        .first()
        .click();
    console.log("Completada volviendo a lista de items")

  });

  test("Crear item estricto gravado con selector", async ({ page }) => {
    // ...
  });

  test("Crear item flexible gravado con variante", async ({ page }) => {
    // ...
  });

  test("Crear item flexible gravado con equivalente", async ({ page }) => {
    // ...
  });
});
