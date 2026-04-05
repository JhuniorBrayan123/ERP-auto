import { type Page, type Locator } from '@playwright/test';

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

  // ── Helpers de texto ──

  /**
   * Elimina acentos/diacríticos y convierte a mayúsculas.
   * "PRECIO ESTÁNDAR" → "PRECIO ESTANDAR"
   */
  private stripAccents(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();
  }

  /**
   * Construye un RegExp que tolera diferencias de acentos.
   * "PRECIO ESTÁNDAR" → /PRECIO EST[AÁÀ]ND[AÁÀ]R/i
   */
  private buildAccentTolerantRegex(text: string): RegExp {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const tolerant = escaped
      .replace(/[aáà]/gi, '[aáà]')
      .replace(/[eéè]/gi, '[eéè]')
      .replace(/[iíì]/gi, '[iíì]')
      .replace(/[oóò]/gi, '[oóò]')
      .replace(/[uúù]/gi, '[uúù]')
      .replace(/[nñ]/gi, '[nñ]');
    return new RegExp(tolerant, 'i');
  }

  // ── Sincronización ──

  /**
   * Espera a que la pantalla "Asignación de columnas" esté completamente
   * renderizada y lista para interactuar.
   *
   * ¿Por qué NO usamos `getByRole('heading')`?
   * El ERP renderiza los títulos con componentes Vue personalizados
   * (ej: `<span class="v-text v-h3 bold">Asignación de columnas</span>`)
   * que se VEN como headings pero NO son elementos `<h1>`-`<h6>` reales.
   * `getByRole('heading')` solo matchea elementos con rol implícito de
   * heading (h1-h6) o rol explícito `role="heading"`. Como esta app usa
   * spans estilizados, ese selector SIEMPRE hará timeout.
   *
   * Solución: Esperamos a que los dropdown arrows de la tabla de mapeo
   * (`.v-select-header-small-arrow` dentro de `th`) sean visibles.
   * Estos elementos son ÚNICOS de este paso del wizard y confirman que
   * la tabla está renderizada y es interactiva.
   */
  async waitForColumnAssignmentStep(): Promise<void> {
    await this.page
      .locator('th .v-select-header-small-arrow')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });
  }

  // ── Mapeo de columnas ──

  /**
   * Mapea una columna del archivo Excel a un campo del sistema en la
   * tabla de asignación de columnas.
   *
   * Estrategia:
   * 1. Usa `page.evaluate` para recorrer el DOM de la tabla buscando
   *    el texto del encabezado Excel con comparación sin acentos
   * 2. Si el th ya empieza con el campo objetivo (normalizado) → no hace nada
   * 3. Si empieza como “Esta columna no…” → abre el dropdown y selecciona
   * 4. Valida por prefijo (el DOM sigue conteniendo el texto de otras opciones)
   *
   * @param fileHeader  - Encabezado del archivo Excel (ej: "PRECIO ESTÁNDAR")
   * @param targetField - Campo del sistema a seleccionar (ej: "PRECIO ESTANDAR")
   *
   * @example
   * await this.mapColumnByFileHeader('PRECIO ESTÁNDAR', 'PRECIO ESTANDAR');
   * await this.mapColumnByFileHeader('TIPO DE AFECTACIÓN IGV', 'Tipo de afectación IGV');
   */
  async mapColumnByFileHeader(
    fileHeader: string,
    targetField: string,
  ): Promise<void> {
    // Acotar TODO a la tabla de mapeo (la que tiene dropdowns en los th)
    // Esto evita strict mode violations cuando hay múltiples tablas en la página
    const mappingTable = this.page.locator('table').filter({
      has: this.page.locator('th .v-select-header-small-arrow'),
    });

    // 1. Encontrar el índice de columna (1-based para :nth-child)
    const targetNormalized = this.stripAccents(fileHeader);

    // Solo la fila de mapeo (dropdowns en th). Si recorremos todas las filas,
    // la fila de vista previa tiene celdas con texto corto ("Precio estándar")
    // que igualan al target y el índice coincide por casualidad, pero luego
    // `th:nth-child(n)` matchea dos filas → strict mode violation.
    const colIndex = await mappingTable.evaluate((tableEl, target) => {
      const normalize = (s: string) =>
        s
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
          .trim();

      const mappingRow = Array.from(tableEl.querySelectorAll('tr')).find(
        (tr) => tr.querySelector('th .v-select-header-small-arrow'),
      );
      if (!mappingRow) return -1;

      const tryCells = (row: HTMLTableRowElement) => {
        const rowCells = row.querySelectorAll('td, th');
        for (let c = 0; c < rowCells.length; c++) {
          const n = normalize(rowCells[c].textContent ?? '');
          if (n === target || n.startsWith(`${target} `)) {
            return c + 1;
          }
        }
        return -1;
      };

      // 1) Fila de mapeo: "PRECIO ESTÁNDAR Esta columna…" o ya mapeado igual al Excel
      const fromMapping = tryCells(mappingRow as HTMLTableRowElement);
      if (fromMapping > 0) return fromMapping;

      // 2) Fallback: fila de vista previa con encabezado corto ("Precio estándar").
      // En combos/insumos/recetas/servicios la fila de mapeo puede seguir en
      // "Esta columna no es importante" y solo la segunda fila refleja el Excel.
      const rows = tableEl.querySelectorAll('tr');
      for (const row of rows) {
        if (row === mappingRow) continue;
        const rowCells = row.querySelectorAll('td, th');
        for (let c = 0; c < rowCells.length; c++) {
          if (normalize(rowCells[c].textContent ?? '') === target) {
            return c + 1;
          }
        }
      }
      return -1;
    }, targetNormalized);

    if (colIndex <= 0) {
      // No se encontró la columna — no se requiere mapeo (ej: Listas)
      return;
    }

    // 2. Verificar si ya está auto-mapeada (solo la fila de dropdowns, no la de preview)
    const mappingHeaderRow = mappingTable.locator('tr').filter({
      has: this.page.locator('th .v-select-header-small-arrow'),
    }).first();
    const thLocator = mappingHeaderRow.locator(`th:nth-child(${colIndex})`);
    const currentText = await thLocator.textContent({ timeout: 3_000 });
    const curNorm = this.stripAccents(currentText ?? '');
    const targetNorm = this.stripAccents(targetField);

    // Ya muestra el campo objetivo al inicio (el th incluye mucho texto de opciones;
    // no usar includes('Esta columna no') porque sigue apareciendo en el blob aunque esté bien mapeado).
    if (curNorm.startsWith(targetNorm) || curNorm.startsWith(targetNormalized)) {
      return;
    }

    // Solo intentar mapear si el valor visible empieza como “columna no importante”
    if (!curNorm.startsWith('ESTA COLUMNA NO')) {
      return;
    }

    // 3. Abrir el dropdown de esa columna
    await thLocator
      .locator('.v-select-header-small-arrow')
      .click({ timeout: 5_000 });

    // 4. Seleccionar la opción del sistema (tolerante a acentos)
    const optionRegex = this.buildAccentTolerantRegex(targetField);

    // Solo el panel del dropdown abierto: si no, hay muchas opciones "Precio estándar"
    // en listas ocultas del mismo paso y Playwright entra en strict mode.
    await this.page
      .locator('.v-select-base-options.is-open')
      .locator('.v-text.v-p.regular.ellipsis.text-align-left')
      .filter({ hasText: optionRegex })
      .first()
      .click({ timeout: 5_000 });

    // 5. Validar por prefijo: el valor elegido va primero; el resto puede incluir "Esta columna no…"
    const updatedText = await thLocator.textContent({ timeout: 3_000 });
    const updNorm = this.stripAccents(updatedText ?? '');
    if (!updNorm.startsWith(targetNorm) && !updNorm.startsWith(targetNormalized)) {
      throw new Error(
        `Mapeo de columna falló: "${fileHeader}" → "${targetField}". ` +
          `El encabezado muestra: "${(updatedText ?? '').trim()}"`,
      );
    }
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
