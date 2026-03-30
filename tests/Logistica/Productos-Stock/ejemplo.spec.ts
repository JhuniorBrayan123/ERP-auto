import { test, expect } from "@playwright/test";
import { InventarioPage } from "../pages/InventarioPage";

test.describe("Módulo de Productos e Inventario (POM Refactor)", () => {
  test.describe.configure({ mode: "parallel" });
  
  let inventarioPage: InventarioPage;

  test.beforeEach(async ({ page }) => {
    inventarioPage = new InventarioPage(page);
    await inventarioPage.navegarAProductos();
  });

  test("Crear item estricto gravado - Básico", async () => {
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombreProducto = `Item automatizado gravado estricto basico ${fechaHora}`;
    
    await inventarioPage.iniciarCreacionNuevoProducto(true);
    await inventarioPage.llenarDatosBasicos(nombreProducto, "100");
    await inventarioPage.configurarStockEstricto("50", "JHUNIOR");
    
    // Paso especial del basico: click en Opcional y en Ninguna
    // Como es específico, podemos hacerlo directamente o crear un método. 
    // Para no ensuciar la Page Object con un caso borde, lo usamos directamente 
    // pero idealmente se mapearía en la clase si es recurrente.
    await inventarioPage.page.getByText("(Opcional)").nth(1).click();
    await inventarioPage.page.locator("div").filter({ hasText: /^Ninguna$/ }).nth(2).click();
    await inventarioPage.esperarCarga();

    await inventarioPage.guardarProductoBotonoBase();
    console.log(`Producto modificado con éxito: ${nombreProducto}`);
    
    // Validacion rápida
    await inventarioPage.botonIrAListaItems.click();
    await inventarioPage.botonAccionesGridTop.click();
    await inventarioPage.opcionVerItemLista.click();
    await inventarioPage.page.getByText("Ver", { exact: true }).click();
    await inventarioPage.page.locator(".v-modal > div").first().click();
    await inventarioPage.botonAtras.click();
  });

  test("Crear item estricto gravado con variante", async () => {
    test.setTimeout(120000); // Test largo
    
    const fecha = new Date();
    const fechaHora = fecha.toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombreProducto = `Item automatizado gravado estricto variante ${fechaHora}`;

    await inventarioPage.iniciarCreacionNuevoProducto(true);
    await inventarioPage.llenarDatosBasicos(nombreProducto, "10");
    await inventarioPage.configurarStockEstricto("100", "JHUNIOR");
    
    await inventarioPage.agregarMultiplesVariantes();
    
    await inventarioPage.guardarProductoBotonoBase();
    await inventarioPage.verificarAccionesPostCreacion(nombreProducto);
  });

  test("Crear item estricto gravado con equivalente", async () => {
    const fecha = new Date();
    const fechaHora = fecha.toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombreItem = `Item automatizado gravado estricto variante ${fechaHora}`;

    await inventarioPage.iniciarCreacionNuevoProducto(true);
    await inventarioPage.llenarDatosBasicos(nombreItem, "10");
    await inventarioPage.configurarStockEstricto("100", "JHUNIOR");

    await inventarioPage.configurarEquivalenciasEstandar();
    
    await inventarioPage.verificarAccionesPostCreacion(nombreItem);
  });

  test("Crear item estricto gravado con selector", async () => {
    test.setTimeout(120000); // Tiempo maximo para que la prueba se complete con todos sus escenarios
    const fechaHora = new Date().toLocaleString('es-PE').replace(/[\/:]/g, '-').replace(', ', '_');
    const nombreSelector = `Item automatizado gravado estricto selector ${fechaHora}`;

    await inventarioPage.iniciarCreacionNuevoProducto(true);
    await inventarioPage.llenarDatosBasicos(nombreSelector, "10");
    await inventarioPage.configurarStockEstricto("100", "JHUNIOR");

    await inventarioPage.configurarSelectorAvanzado("items inventario");
    
    await inventarioPage.guardarProductoBotonoBase();
    await inventarioPage.verificarAccionesPostCreacion(nombreSelector);
  });

  // Los últimos 2 tests estaban vacíos en el archivo original, pero la estructura ya permite agregarlos fácilmente.
  test.skip("Crear item flexible gravado con variante", async () => {
    // Pendiente de implementar usando los métodos de la POM
  });

  test.skip("Crear item flexible gravado con equivalente", async () => {
    // Pendiente de implementar usando los métodos de la POM
  });
});
