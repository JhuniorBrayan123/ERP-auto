import { test, expect } from "@playwright/test";

test.describe("Crear items avanzados", () => {
  test.describe.configure({ mode: "parallel" });

  test("Crear item estricto gravado con variante", async ({ page }) => {
    await page
      .locator(
        ".select-2 > .popup-container > .v-popup > span > .v-select > .v-select-plain > .v-select-base > .v-select-base-header > .v-select-header-plain",
      )
      .click();
    await page
      .locator("div")
      .filter({ hasText: /^Búsqueda de ítems$/ })
      .nth(2)
      .click();
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
      .press("CapsLock");
    await page
      .getByRole("textbox", { name: "Ej. Gaseosa Kola R (500ml)" })
      .fill("N");
    await page
      .getByRole("textbox", { name: "Ej. Gaseosa Kola R (500ml)" })
      .press("CapsLock");
    await page
      .getByRole("textbox", { name: "Ej. Gaseosa Kola R (500ml)" })
      .fill("Nuevo item gravado estricto variante");
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
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .first()
      .click();
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .first()
      .fill("1001");
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .nth(1)
      .click();
    await page
      .locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]')
      .nth(1)
      .fill("100");
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
    await page.getByRole("button", { name: "Ir a lista de ítems" }).click();
    await page
      .locator(
        ".flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle",
      )
      .first()
      .click();
    await page
      .locator(
        '[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]',
      )
      .click();
    await page
      .locator(
        '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:ventas"]',
      )
      .click();
    await page
      .locator(
        '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:compras"]',
      )
      .click();
    await page
      .locator(
        '[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]',
      )
      .click();
    await page.locator(".cmp-option-button-toggle").click();
    const downloadPromise = page.waitForEvent("download");
    await page
      .locator(
        '[id="lgt_ver-item_cmp-dashborard-item_cmp-dropdown-actions-item.drop-item:generar-pdf"]',
      )
      .click();
    const download = await downloadPromise;
    await page
      .locator(
        '[id="lgt_ver-item_content_cmp-info-basica-item.v-text:lista-ver-adicional"]',
      )
      .click();
    await page.locator(".v-modal > div").first().click();
    await page
      .locator(
        '[id="lgt_ver-item_content_cmp-info-basica-item.v-text:combinacion-ver-adicional"]',
      )
      .click();
    await page.locator(".v-modal > div").first().click();
    await page.getByRole("button", { name: "Atrás" }).click();
    await page
      .locator(
        ".flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle",
      )
      .first()
      .click();
  });

  test("Crear item estricto gravado con equivalente", async ({ page }) => {
    // ...
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
