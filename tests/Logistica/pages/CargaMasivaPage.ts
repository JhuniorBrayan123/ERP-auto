import { type Page, type Locator } from '@playwright/test';
import {
  mapColumnByFileHeader as applyColumnMapping,
  waitForColumnAssignmentStep,
} from '../helpers/column-mapping.helper';

/**
 * Page Object para el wizard de carga masiva de ítems desde Excel.
 *
 * Responsabilidades:
 * - Abrir el menú de opciones y entrar a carga masiva
 * - Cerrar popup/guía de bienvenida
 * - Seleccionar tipo de item por ID estable de card
 * - Subir archivo Excel
 * - Asignar columnas en la tabla de mapeo
 * - Seleccionar almacenes
 * - Procesar y volver al inicio
 *
 * NO contiene assertions — eso queda en el spec.
 * NO contiene lógica de manipulación de Excel — eso queda en el helper.
 */
export class CargaMasivaPage {
  constructor(private readonly page: Page) { }

  // ─── Locators ───────────────────────────────────────────────

  private get menuOpciones(): Locator {
    return this.page.locator(
      '[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:options"]',
    );
  }

  private get opcionCargaMasiva(): Locator {
    return this.page.locator(
      '[id="lgt_cmp-items_cmp-datos-items.li:carga-masiva"]',
    );
  }

  private get botonCerrarPopup(): Locator {
    return this.page.locator('.popup-container > .button-close > .icon');
  }

  private get areaOverscreen(): Locator {
    return this.page.locator('.cmp-overscreen.is-open > .area');
  }

  private get botonSiguiente(): Locator {
    return this.page.getByText('Siguiente');
  }

  private get inputArchivo(): Locator {
    return this.page.locator('input[type="file"]');
  }

  private get checkboxTodosAlmacenes(): Locator {
    return this.page
      .locator(
        '[id="lgt_items_creacion-masivos_cmp-asignacion-columnas:elegir-almacenes_v-checkbox:todos-almacenes"] div',
      )
      .filter({ hasText: /^Seleccionar todos$/ });
  }

  private get botonProcesar(): Locator {
    return this.page.getByText('Procesar');
  }

  private get botonIrAlInicio(): Locator {
    return this.page.getByRole('button', { name: 'Ir al inicio' });
  }

  // ─── Paso 1: Abrir carga masiva ────────────────────────────

  /**
   * Abre el menú de opciones del módulo items y selecciona "Carga masiva".
   * Cierra el popup de guía si aparece.
   */
  async abrirCargaMasiva(): Promise<void> {
    await this.menuOpciones.click();
    await this.opcionCargaMasiva.click();

    // Cerrar el popup/guía de bienvenida que aparece la primera vez
    await this.botonCerrarPopup.click().catch(() => { });

    // Cerrar el overscreen de fondo si aparece
    await this.areaOverscreen.click().catch(() => { });
  }

  // ─── Paso 2: Seleccionar tipo de item ──────────────────────

  /**
   * Selecciona un tipo de item clickeando el botón "Seleccionar" de la card correcta.
   *
   * Busca la card por su texto visible (ej: "Productos", "Servicios")
   * dentro del contenedor .cmp-card-item y clickea su botón "Seleccionar".
   *
   * Esto reemplaza el frágil getByRole("button", { name: "Seleccionar" }).first()
   * del codegen y evita el problema de IDs duplicados dentro de la card.
   *
   * @param cardLabel - Texto visible de la card (ej: "Productos", "Servicios")
   */
  async seleccionarTipoItem(cardLabel: string): Promise<void> {
    // Usa getByText con exact: true para evitar que "Productos"
    // también matchee "Lista de productos" (substring)
    const card = this.page
      .locator('.cmp-card-item')
      .filter({ has: this.page.getByText(cardLabel, { exact: true }) });

    await card.getByRole('button', { name: 'Seleccionar' }).click();
  }

  // ─── Paso 3: Avanzar con Siguiente ─────────────────────────

  /** Clickea "Siguiente" para avanzar al próximo paso del wizard */
  async clickSiguiente(): Promise<void> {
    await this.botonSiguiente.click();
  }

  // ─── Paso 4: Subir archivo Excel ───────────────────────────

  /**
   * Sube un archivo Excel al input de carga masiva.
   * Usa setInputFiles directamente sobre el input[type="file"]
   * en lugar del botón "Seleccionar archivo" para mayor estabilidad.
   *
   * @param filePath - Ruta absoluta al archivo Excel temporal generado
   */
  async subirArchivo(filePath: string): Promise<void> {
    await this.inputArchivo.setInputFiles(filePath);
    // Esperar explícitamente el mensaje de subida exitosa para evitar 
    // race conditions al hacer click en Siguiente muy rápido
    await this.page.getByText('Archivo subido correctamente').waitFor({ state: 'visible' });
  }

  // ─── Paso 5: Asignación de columnas ────────────────────────

  /**
   * Espera la tabla de mapeo con dropdowns en `th` (no hay heading semántico real).
   */
  async waitForColumnAssignmentStep(): Promise<void> {
    await waitForColumnAssignmentStep(this.page);
  }

  /**
   * Delega en {@link mapColumnByFileHeader} del helper compartido.
   */
  async mapColumnByFileHeader(fileHeader: string, targetField: string): Promise<void> {
    await applyColumnMapping(this.page, fileHeader, targetField);
  }

  // ── Orquestación ──

  /**
   * Método principal de asignación de columnas.
   *
   * 1. Espera a que el paso esté completamente renderizado
   * 2. Mapea cualquier columna que no fue auto-asignada por el sistema
   *
   * Actualmente mapea:
   * - PRECIO ESTÁNDAR → PRECIO ESTANDAR (necesario para la mayoría de tipos)
   *
   * Si todas las columnas ya están auto-mapeadas, no interactúa con
   * ningún dropdown y simplemente continúa.
   */
  async asignarColumnas(): Promise<void> {
    await this.waitForColumnAssignmentStep();

    // Mapear PRECIO ESTÁNDAR si no se auto-mapeó por diferencia de acentos
    await this.mapColumnByFileHeader('PRECIO ESTÁNDAR', 'PRECIO ESTANDAR');
  }

  // ─── Paso 6: Selección de almacenes ────────────────────────

  /** Clickea "Seleccionar todos" para los almacenes */
  async seleccionarTodosAlmacenes(): Promise<void> {
    await this.checkboxTodosAlmacenes.click();
  }

  // ─── Paso 7: Procesar ──────────────────────────────────────

  /** Clickea "Procesar" para iniciar la carga masiva */
  async clickProcesar(): Promise<void> {
    await this.botonProcesar.click();
  }

  // ─── Paso 8: Volver al inicio ──────────────────────────────

  /**
   * Clickea "Ir al inicio" para regresar a la lista general de ítems.
   * Espera a que la página cargue completamente.
   */
  async clickIrAlInicio(): Promise<void> {
    await this.botonIrAlInicio.click();
    await this.page.waitForLoadState('networkidle');
  }

  // ─── Flujo completo ────────────────────────────────────────

  /**
   * Ejecuta el flujo completo de carga masiva:
   * 1. Seleccionar tipo → Siguiente
   * 2. Subir archivo → Siguiente
   * 3. Asignar columna ESTANDAR → Siguiente
   * 4. Seleccionar almacenes → Procesar
   *
   * @param cardLabel - Texto visible de la card del tipo de item
   * @param filePath - Ruta al archivo Excel temporal
   */
  async ejecutarFlujoCargaMasiva(cardLabel: string, filePath: string): Promise<void> {
    // Paso 1: Seleccionar tipo
    await this.seleccionarTipoItem(cardLabel);
    await this.clickSiguiente();

    // Paso 2: Subir archivo
    await this.subirArchivo(filePath);
    await this.clickSiguiente();

    // Paso 3: Asignar columna ESTANDAR → Precio estándar
    await this.asignarColumnas();
    await this.clickSiguiente();

    // Paso 4: Seleccionar almacenes y procesar
    await this.seleccionarTodosAlmacenes();
    await this.clickProcesar();
  }
}
