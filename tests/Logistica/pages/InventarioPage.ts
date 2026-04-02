import { Page, Locator, expect } from '@playwright/test';

export class InventarioPage {
  readonly page: Page;
  //Suite case y use case igual que en la arquitectura de microfrontends;

  // Locators Generales
  readonly overlayCarga: Locator;
  readonly menuProductosServicios: Locator;
  readonly opcionBusquedaItems: Locator;

  // Formularios de Creación
  readonly botonCrear: Locator;
  readonly opcionNuevoProducto: Locator;
  readonly opcionOpcionesAvanzadas: Locator;
  readonly inputNombreProducto: Locator;
  readonly inputMontoFinalSoles: Locator;
  readonly inputMontoFinalDolares: Locator;


  // Tabs (Stock, Variantes, Equivalencias, Selectores)
  readonly tabStock: Locator;
  readonly opcionControlEstricto: Locator;
  readonly tabCamposAdicionales: Locator;
  readonly botonAnadirVariante: Locator;
  readonly tabEquivalencias: Locator;
  readonly botonAquiEquivalencia: Locator;
  readonly botonCrearOAgregarEquivalencia: Locator;
  readonly inputPrecioBaseSoles: Locator;
  readonly inputPrecioBaseDolares: Locator;
  readonly tabSelectores: Locator;

  // Botones de Guardado / Navegación
  readonly botonCrearProductoBase: Locator;
  readonly botonIrAListaItems: Locator;
  readonly botonAccionesGridTop: Locator;
  readonly opcionVerItemLista: Locator;
  readonly botonAceptarRegistroItem: Locator;

  // Tabs dentro de "Ver ítem"
  readonly tabVentasItem: Locator;
  readonly tabComprasItem: Locator;
  readonly tabBitacoraItem: Locator;
  readonly botonAtras: Locator;

  // Opciones de creación por tipo de ítem
  readonly opcionNuevoServicio: Locator;
  readonly opcionNuevoInsumo: Locator;
  readonly opcionNuevoCombo: Locator;
  readonly opcionNuevaReceta: Locator;
  readonly opcionNuevaLista: Locator;
  readonly inputDescripcionItem: Locator;

  constructor(page: Page) {
    this.page = page;

    // Locators Generales
    this.overlayCarga = page.locator('#cmn_cmp-overload\\:loading');
    this.menuProductosServicios = page.getByText("Productos y servicios").first();
    this.opcionBusquedaItems = page.locator("div").filter({ hasText: /^Búsqueda de ítems$/ }).nth(2);

    // Botones de inicio de flujo
    this.botonCrear = page.locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:crear"]');
    this.opcionNuevoProducto = page.getByText("PNuevo producto"); // Textos extraños desde el spec original
    this.opcionOpcionesAvanzadas = page.locator("div").filter({ hasText: /^Opciones avanzadas \(opcional\)$/ });

    // Inputs Básicos
    this.inputNombreProducto = page.getByRole("textbox", { name: "Ej. Gaseosa Kola R (500ml)" });
    this.inputMontoFinalSoles = page.getByRole("textbox", { name: "Monto final" }).nth(0);
    this.inputMontoFinalDolares = page.getByRole("textbox", { name: "Monto final" }).nth(1);
    this.inputPrecioBaseSoles = page.getByRole('textbox', { name: 'precio base' }).nth(0);
    this.inputPrecioBaseDolares = page.getByRole('textbox', { name: 'precio base' }).nth(1);

    // Locators Stock
    this.tabStock = page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-1"]').nth(1);
    this.opcionControlEstricto = page.locator('[id="lgt_reg-item_v-tab:stock-almacen_cmp-card-stock:control-estricto"]');

    // Locators Equivalencias
    this.tabEquivalencias = page.getByText("Equivalencias(Opcional)");
    this.botonAquiEquivalencia = page.getByText('AQUÍ');
    this.botonCrearOAgregarEquivalencia = page.getByRole('button', { name: 'Agregar equivalencia' });

    // Locators Variantes y Selectores
    this.tabCamposAdicionales = page.locator('[id="lgt_cmp-registro-item_cmp-body-item_cmp-tabs-item.v-tabs:tabs-5"]').nth(5);
    this.botonAnadirVariante = page.getByText("Añadir una nueva variante");
    this.tabSelectores = page.getByText("Selectores(Opcional)");

    // Guardado
    this.botonCrearProductoBase = page.getByRole("button", { name: "Crear producto" });
    this.botonAceptarRegistroItem = page.locator('[id="lgt_reg-item_v-button:aceptar-registro-item"]');
    this.botonIrAListaItems = page.getByRole("button", { name: "Ir a lista de ítems" });

    // Lista de ítems interactuable
    this.botonAccionesGridTop = page.locator(".flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle").first();
    this.opcionVerItemLista = page.locator('[id="lgt_movimientos_cmp-grid-options:opciones_movimiento_cmp-dropdown:options-li:ver-item"]');

    // Tabs ver ítem
    this.tabVentasItem = page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:ventas"]');
    this.tabComprasItem = page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:compras"]');
    this.tabBitacoraItem = page.locator('[id="lgt_ver-item_cmp-dashboard-item:tabs:cmp-tabs-options-item:opcion_div:bitacora"]');
    this.botonAtras = page.getByRole("button", { name: "Atrás" });

    // Opciones de tipo de ítem
    this.opcionNuevoServicio = page.getByText('SNuevo servicio', { exact: true });
    this.opcionNuevoInsumo = page.getByText('INuevo insumo', { exact: true });
    this.opcionNuevoCombo = page.getByText('CNuevo combo', { exact: true });
    this.opcionNuevaReceta = page.getByText('RNueva receta', { exact: true });
    this.opcionNuevaLista = page.getByText('LNueva lista', { exact: true });
    this.inputDescripcionItem = page.getByRole('textbox', { name: 'Descripción del ítem' });
  }

  // --- MÉTODOS DE APLICACIÓN DE FLUJO --- //

  /**
   * Espera a que el overlay de carga se oculte. 
   * Es vital para evitar flakiness en las pruebas.
   */
  async esperarCarga(timeout = 60000) {
    try {
      await this.overlayCarga.waitFor({ state: 'hidden', timeout });
    } catch (e) {
      console.log(`El loader demoró más de ${timeout}ms, verificando si podemos continuar...`);
    }
  }

  /**
   * Navega desde la base hasta la vista de "Búsqueda de ítems".
   */
  async navegarAProductos() {
    await this.page.goto('/');
    await this.esperarCarga();

    await expect(this.menuProductosServicios).toBeVisible({ timeout: 20000 });
    await this.menuProductosServicios.click();
    await this.opcionBusquedaItems.click();
    
    // Esperar explícitamente a que cargue la "Búsqueda de ítems".
    // Esto previene excepciones críticas en el frontend (cmp-page-error) si se presiona "Crear" antes de obtener los datos base.
    await this.esperarCarga();
    await this.botonCrear.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Proceso inicial para abrir la creación de un nuevo producto.
   */
  async iniciarCreacionNuevoProducto(opcionesAvanzadas = true) {
    await this.botonCrear.click();
    await this.opcionNuevoProducto.click();
    await this.esperarCarga(); // Esperamos que se instancie el modal para evitar render errors
    
    if (opcionesAvanzadas) {
      await this.opcionOpcionesAvanzadas.click();
    }
  }

  /**
   * Rellena el título del producto y su monto final.
   */
  async llenarDatosBasicos(nombre: string, montoSoles: string, montoDolares: string) {
    await this.inputNombreProducto.click();
    await this.inputNombreProducto.fill(nombre);
    await this.inputMontoFinalSoles.fill(montoSoles);
    await this.inputMontoFinalDolares.fill(montoDolares);
  }

  /**
   * Navega y configura el stock en el almacén indicado en modo estricto.
   */
  async configurarStockEstricto(cantidad: string, nombreAlmacen: string) {
    await this.tabStock.click();
    await this.opcionControlEstricto.click();

    const cardAlmacen = this.page.locator(".cmp-card-almacen").filter({
      has: this.page.getByText(nombreAlmacen, { exact: true }),
    });

    const inputCantidad = cardAlmacen.locator('input[id="lgt_cmp-card-almacen_v-step:cantidad"]');

    await expect(cardAlmacen).toHaveCount(1);
    await expect(inputCantidad).toHaveCount(1);

    await inputCantidad.fill(cantidad);
    console.log(`Stock estricto configurado: ${cantidad} en almacén ${nombreAlmacen}`);
  }

  /**
   * Recrea el flujo pesado de agregar múltiples variantes y su stock 
   * (HP 16GB 128GB, Apple 32GB 500GB, etc)
   */
  async agregarMultiplesVariantes() {
    await this.page.getByText("Campos adicionales(Opcional)").click();
    await this.tabCamposAdicionales.click();

    console.log("Agregando 3 variantes base...");
    await this.botonAnadirVariante.click();
    await this.botonAnadirVariante.click();
    await this.botonAnadirVariante.click();

    // Llenar Variante 1 (Hp, 16GB, 128GB)
    await this.page.locator("div:nth-child(2) > div > .card > .content-card > div:nth-child(2) > div > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form").first().click();
    await this.page.locator("div").filter({ hasText: /^Hp$/ }).nth(1).click();

    await this.page.locator("div:nth-child(2) > div > .card > .content-card > div:nth-child(2) > div:nth-child(2) > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form").click();
    await this.page.getByText("16 GB").nth(1).click();

    await this.page.locator("div:nth-child(2) > div > .card > .content-card > div:nth-child(2) > div:nth-child(3) > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form").click();
    await this.page.getByText("128 GB").nth(1).click();

    // Llenar Variante 2 (Apple, 32GB, 500GB)
    await this.page.locator("div:nth-child(3) > div > .card > .content-card > div:nth-child(2) > div > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form").first().click();
    await this.page.getByText("Apple").nth(2).click();

    await this.page.locator("div:nth-child(3) > div > .card > .content-card > div:nth-child(2) > div:nth-child(2) > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form").click();
    await this.page.getByText("32 GB").nth(2).click();

    await this.page.locator("div:nth-child(3) > div > .card > .content-card > div:nth-child(2) > div:nth-child(3) > .v-select > .v-select-form > .v-select-base > .v-select-base-header > .v-select-header-base-form > .v-select-header-form").click();
    await this.page.locator("div").filter({ hasText: /^500 GB$/ }).nth(2).click();

    // Administrar stock Variante 1
    await this.administrarStockVariante(0, "100", "100");
    // Administrar stock Variante 2
    await this.administrarStockVariante(1, "100", "100");
    // Administrar stock Variante 3
    await this.administrarStockVariante(2, "100", "100");
  }

  /**
   * Helper invocado por `agregarMultiplesVariantes` para simplificar la gestión de stock
   */
  private async administrarStockVariante(indexVariante: number, cantidad1: string, cantidad2: string) {
    await this.page.locator('[id="lgt_reg-item_v-tab:variantes-item_cmp-dropdown:opciones"]')
      .nth(indexVariante).click();
    await this.page.getByText("Administrar stock de esta").nth(indexVariante).click();

    await this.page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').first().click();
    await this.page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').first().fill(cantidad1);

    await this.page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').nth(1).click();
    await this.page.locator('[id="lgt_cmp-card-almacen_v-step:cantidad"]').nth(1).fill(cantidad2);

    await this.page.getByRole("button", { name: "Guardar stock" }).click();
  }

  /**
   * Crea dos equivalencias (Equivalente X2 y Equivalente X3) con sus reglas de precio e incremento.
   */
  async configurarEquivalenciasEstandar() {
    await this.page.getByText("Equivalencias(Opcional)").click();
    await this.esperarCarga();

    console.log("Ingresando a módulo de creación de equivalencias");
    await this.page.getByText('AQUÍ').click();
    await this.esperarCarga();

    // Equivalencia 1
    console.log("Creando primera equivalente (Equivalente X2)");
    await this.page.getByRole('textbox', { name: 'Digita el nombre de la' }).fill('Equivalente X2');
    await this.page.locator('div').filter({ hasText: /^Seleccionar$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^Gravado \(Paga IGV 18%\)$/ }).first().click();

    // Incrementar cantidad x2 (2 clicks en el divisor)
    await this.page.locator('[id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad_div:increase"]').click();
    await this.page.locator('[id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad_div:increase"]').click();

    await this.esperarCarga();

    await this.inputPrecioBaseSoles.fill('11');
    await this.inputPrecioBaseDolares.fill('11');
    await this.page.getByRole('button', { name: 'Crear Equivalencia' }).click();
    await this.esperarCarga();

    // Equivalencia 2
    console.log("Creando la segunda equivalencia (Equivalente X3)");
    await this.page.getByRole('button', { name: 'Agregar equivalencia' }).click();

    await this.page.getByRole('textbox', { name: 'Digita el nombre de la' }).click();
    await this.page.getByRole('textbox', { name: 'Digita el nombre de la' }).fill('equivalente X3');

    await this.page.locator('div').filter({ hasText: /^Seleccionar$/ }).nth(2).click();
    await this.page.locator('div').filter({ hasText: /^Gravado \(Paga IGV 18%\)$/ }).first().click();

    // Incrementar cantidad x3 (3 clicks)
    await this.page.locator('[id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad_div:increase"]').click();
    await this.page.locator('[id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad_div:increase"]').click();
    await this.page.locator('[id="lgt_reg-item_v-drape:gestion-equivalencia_v-step:cantidad_div:increase"]').click();

    await this.inputPrecioBaseSoles.fill('11');
    await this.inputPrecioBaseDolares.fill('11');
    await this.page.getByRole('button', { name: 'Crear Equivalencia' }).click();
    await this.esperarCarga();

    // Al manejar equivalencias, tienen este tipo de guardado extra en el test viejo
    await this.botonAceptarRegistroItem.click();
    await this.esperarCarga();
  }

  /**
   * Configura un selector compuesto de ítems y selectores manuales extras (flujo de Selectores Avanzados)
   */
  async configurarSelectorAvanzado(tituloSelector: string) {
    await this.tabSelectores.click();
    await this.esperarCarga();

    console.log("Ingresando a módulo de selectores");
    await this.page.getByText('Añadir selector').click();
    await this.page.getByRole('button', { name: 'Nuevo selector' }).click();

    await this.page.getByRole('textbox', { name: 'Digita el título del selector' }).click();
    await this.page.getByRole('textbox', { name: 'Digita el título del selector' }).fill(tituloSelector);

    // Selectores con items listados
    await this.page.getByText('Crear selectores con ítems de').click();

    await this.page.getByRole('textbox', { name: 'Buscar nombre del producto o' }).click();
    await this.page.getByRole('textbox', { name: 'Buscar nombre del producto o' }).fill('variante');
    await this.page.getByText('Item automatizado gravado').first().click();

    await this.page.getByRole('textbox', { name: 'Buscar nombre del producto o' }).clear();
    await this.page.getByRole('textbox', { name: 'Buscar nombre del producto o' }).click();
    await this.page.getByRole('textbox', { name: 'Buscar nombre del producto o' }).fill('equivalente');
    await this.page.getByText('equivalente').first().click();

    // Selectores manuales tipo Libre
    await this.page.locator('[id="lgt_reg-item_cmp-card-selectores:opcion_div:libre"]').click();

    await this.page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:nombre"]').nth(2).click();
    await this.page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:nombre"]').nth(2).fill('selector manual');
    await this.page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]').nth(2).click();
    await this.page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]').nth(2).fill('0100');

    await this.page.getByRole('button', { name: 'Añadir opción' }).click();

    await this.page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:nombre"]').nth(3).click();
    await this.page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:nombre"]').nth(3).fill('nuevo selector manual');
    await this.page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]').nth(3).click();
    await this.page.locator('[id="lgt_reg-item_v-drape:gestion-selector_selector-opcion:item_v-input:precio"]').nth(3).fill('050');

    await this.page.getByRole('button', { name: 'Crear selector' }).click();

    // Toggle (Switch) obligatorio
    await this.page.locator('.obligatorio > div > .v-switch > .switch-content > .switch > .slider').click();
  }

  /**
   * Guarda el producto ya sea por el flujo básico/variante que usa "Crear producto" o de forma implícita.
   */
  async guardarProductoBotonoBase() {
    await this.botonCrearProductoBase.click();
    await this.esperarCarga();
  }

  /**
   * Navega de vuelta a la lista y revisa los modales de Ventas, Compras y Bitácora
   * de un producto puntual recién creado.
   */
  async verificarAccionesPostCreacion(nombreProducto: string) {
    console.log(`Producto guardado: ${nombreProducto}, verificando lista y post-acciones.`);

    // Aseguramos que no haya un loader activo antes de dar click en ir a la lista de items
    await this.esperarCarga();

    await this.botonIrAListaItems.click({ timeout: 60000 });
    console.log("Redirigido a lista de ítems");
    await this.esperarCarga();

    // Aseguramos que el botón de acciones del grid esté visible antes de continuar
    await this.botonAccionesGridTop.waitFor({ state: 'visible', timeout: 45000 });

    // Abriendo menú contextual del grid
    await this.botonAccionesGridTop.click();

    console.log(`Abriendo acciones de ${nombreProducto}`);
    await this.opcionVerItemLista.click();
    await this.esperarCarga();

    console.log("Visualizando ficha general de ventas");
    await this.tabVentasItem.click();
    await this.esperarCarga();

    console.log("Visualizando compras del item");
    await this.tabComprasItem.click({ timeout: 30000 });
    await this.esperarCarga();

    console.log("Visualizando bitácora del item");
    await this.tabBitacoraItem.click();
    await this.esperarCarga();

    await this.botonAtras.click();
    await this.esperarCarga();
    await this.botonAccionesGridTop.click();
    console.log("Verificación post-creación completada con éxito.");
  }

  // --- MÉTODOS COMPARTIDOS PARA TODOS LOS TIPOS DE ÍTEMS --- //

  /**
   * Abre el menú de creación y selecciona el tipo de ítem.
   */
  async iniciarCreacionItem(tipo: 'servicio' | 'insumo' | 'combo' | 'receta' | 'lista') {
    const opciones = {
      servicio: this.opcionNuevoServicio,
      insumo: this.opcionNuevoInsumo,
      combo: this.opcionNuevoCombo,
      receta: this.opcionNuevaReceta,
      lista: this.opcionNuevaLista,
    };
    await this.botonCrear.click();
    await opciones[tipo].click();
    await this.esperarCarga();
    console.log("Inicio de creacion pasado")
  }

  /**
   * Abre la sección de opciones avanzadas del formulario.
   */
  async abrirOpcionesAvanzadas() {
    await this.opcionOpcionesAvanzadas.click();
    console.log("AbrirOpcionesAvanzadas");
  }

  /**
   * Navega de vuelta a la lista de ítems después de crear.
   */
  async irAListaDeItems() {
    await this.esperarCarga();
    await this.botonIrAListaItems.click({ timeout: 60000 });
    await this.esperarCarga();
    console.log("Navegando a lista de items pasada")
  }

  /**
   * Verifica bitácora desde el grid: Acciones → Ver item → Bitácora → Atrás.
   */
  async verificarBitacoraDesdeGrid() {
    await this.botonAccionesGridTop.waitFor({ state: 'visible', timeout: 45000 });
    await this.botonAccionesGridTop.click();
    await this.opcionVerItemLista.click();
    await this.esperarCarga();
    await this.tabBitacoraItem.click();
    await this.esperarCarga();
    await this.botonAtras.click();
    await this.esperarCarga();
    console.log("Completado")
  }
}
