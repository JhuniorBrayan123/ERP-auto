import { test, expect } from "@playwright/test";

test("crear item estricto", async ({ page }) => {

  const timestamp = Date.now(); // Ej: 1711704500123
  const nombreProducto = `Item automatizado gravado estricto ${timestamp}`;

  await page.goto("/auth/login");
  console.log("Ingresando a la página del login");

  await page.getByRole("textbox", { name: /Coloca aquí tu correo/i }).fill(process.env.USER_EMAIL!);
  await page.getByRole("textbox", { name: /Coloca aquí tu contraseña/i }).fill(process.env.USER_PASSWORD!);
  await page.getByRole("button", { name: /INICIAR SESION/i }).click();

  await expect(page).not.toHaveURL(/auth\/login/, { timeout: 15000 });
  console.log("Login exitoso, redirigido al sistema");

  await expect(page.getByText("Productos y servicios")).toBeVisible();
  await page.getByText("Productos y servicios").click();

  await page.locator("div").filter({ hasText: /^Búsqueda de ítems$/ }).nth(2).click();
  await page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]').click();
  await page.getByText("PNuevo producto").click();
  await page.locator("div").filter({ hasText: /^Opciones avanzadas \(opcional\)$/ }).click();

  //
  await page.getByRole("textbox", { name: "Ej. Gaseosa Kola R (500ml)" }).fill(nombreProducto);

  await page.getByRole("textbox", { name: "Monto final" }).click();
  await page.getByRole("textbox", { name: "Monto final" }).fill("100");

  await page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1).click();
  await page.locator('[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto"]').click();

  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').click();
  await page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').fill("50");

  await page.getByText("(Opcional)").nth(1).click();
  await page.locator("div").filter({ hasText: /^Ninguna$/ }).nth(2).click();
  await page.getByText("VARIOS").click();

  await page.getByRole("button", { name: "Crear producto" }).click();

  console.log(`Producto creado con éxito: ${nombreProducto}`);

  await page.getByRole("button", { name: "Ir a lista de ítems" }).click();
  console.log("Redirigido a lista de ítems");

  await page.locator(".flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle").first().click();
  await page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]').click();
  await page.getByText("Ver", { exact: true }).click();
  await page.locator(".v-modal > div").first().click();
  await page.getByRole("button", { name: "Atrás" }).click();
});