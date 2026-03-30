import {test, expect, Page} from "@playwright/test";

test("crear item basico estricto", async ({ page }) => {

    async function waitForOverlay(page: Page, timeout = 30000) {
        await page.locator('#cmn_cmp-overload\\:loading').waitFor({
            state: 'hidden',
            timeout
        });
    }
    const fecha = new Date();
    const fechaHora = fecha.toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');

    const nombreProducto = `Item automatizado gravado estricto variante ${fechaHora}`;

    await page.goto('/');

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

    // cards de los almacenes:
    const cardJhunior = page.locator(".cmp-card-almacen").filter({
      has: page.getByText("JHUNIOR", { exact: true }),
    });

    const inputCantidad = cardJhunior.locator(
      'input[id="lgt_cmp-card-almacen_v-step:cantidad"]',
    );

    await expect(cardJhunior).toHaveCount(1);
    await expect(inputCantidad).toHaveCount(1);

    await inputCantidad.fill("50");

    await page.getByText("(Opcional)").nth(1).click();
    await page.locator("div").filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await waitForOverlay(page);

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