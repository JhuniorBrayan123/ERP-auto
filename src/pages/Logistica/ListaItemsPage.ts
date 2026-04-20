import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object para la lista de ítems y la vista de movimientos post-edición.
 * download'
 * Responsabilidades:
 * - Buscar ítems por código en la lista
 * - Abrir menú de acciones del item encontrado
 * - Seleccionar acciones: Editar, Clonar
 * - Navegar a "Ver item" desde la vista de movimientos (post-edición)
 * - Esperar desaparición del overlay de carga
 *
 * NO modifica datos ni valida — solo interactúa con la lista y los menús.
 */
export class ListaItemsPage {
  constructor(private readonly page: Page) {}

  // ─── Locators ───────────────────────────────────────────────

  private get searchInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Buscar por nombre, código o c' });
  }

  private get actionsToggle(): Locator {
    return this.page
      .locator(
        '.flex-row-align-items-center-justify-content-center > .cmp-dropdown > .cmp-dropdown-toggle',
      )
      .first();
  }

  // ─── Búsqueda por código ────────────────────────────────────

  /**
   * Busca un item en la lista por código.
   * Espera a que el overlay de carga desaparezca antes de continuar.
   */
  async searchByCode(code: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(code);

    // Clickear el botón de búsqueda para ejecutar el filtro
    await this.page
      .locator('[id="lgt_items_cmp-filtro-items:filtro:filtro_section_v-input:button_search"]')
      .click();

    // Esperar a que aparezca el overlay de carga (confirma que la búsqueda inició)
    await this.page
      .locator('[id="cmn_cmp-overload:loading"]')
      .waitFor({ state: 'visible', timeout: 5_000 })
      .catch(() => {}); // Puede no aparecer si la carga fue instantánea

    // Esperar a que desaparezca el overlay de carga (confirma que la búsqueda terminó)
    await this.page
      .locator('[id="cmn_cmp-overload:loading"]')
      .waitFor({ state: 'hidden', timeout: 15_000 })
      .catch(() => {});

    // Esperar a que la red quede inactiva para asegurar que el DOM
    // terminó de renderizar completamente (evita detach de elementos)
    await this.page.waitForLoadState('networkidle');
  }

  /** Limpia el campo de búsqueda */
  async clearSearch(): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.clear();
  }

  // ─── Menú de acciones del item ──────────────────────────────

  /** Abre el menú desplegable de acciones del primer item visible en la lista */
  async openActionsMenu(): Promise<void> {
    await this.actionsToggle.click();
  }

  /** Clickea "Edición item" desde el menú de acciones */
  async clickEditItem(): Promise<void> {
    await this.page
      .locator(
        '[id="lgt_items_cmp-grid-options:opciones_items_cmp-dropdown:options-li:edicion-item"]',
      )
      .click();
  }

  /** Clickea "Clonar item" desde el menú de acciones */
  async clickCloneItem(): Promise<void> {
    await this.page
      .locator(
        '[id="lgt_items_cmp-grid-item-option:opciones_items_cmp-dropdown:options-li:clonar-item"]',
      )
      .click();
  }

  // ─── Flujos compuestos ──────────────────────────────────────

  /** Busca un item por código y abre el formulario de edición */
  async searchAndEdit(code: string): Promise<void> {
    await this.searchByCode(code);
    await this.openActionsMenu();
    await this.clickEditItem();
  }

  /** Busca un item por código y abre el formulario de clonado */
  async searchAndClone(code: string): Promise<void> {
    await this.searchByCode(code);
    await this.openActionsMenu();
    await this.clickCloneItem();
  }

  // ─── Vista de movimientos (post-edición) ────────────────────

  /**
   * Abre el menú de acciones del primer movimiento visible.
   * Usado después de editar un item, cuando el ERP muestra la vista de movimientos.
   */
  async openFirstMovementActions(): Promise<void> {
    await this.actionsToggle.click();
  }

  /** Clickea "Ver item" desde el menú de opciones de movimiento */
  async clickVerItemFromMovements(): Promise<void> {
    const option = this.page.getByText(/^Ver item$/i).first();
    if (await option.isVisible().catch(() => false)) {
      await option.click();
      return;
    }

    throw new Error('No se encontró la opción "Ver item" en movimientos.');
  }

  /**
   * Flujo post-edición: abre acciones del primer movimiento → Ver item.
   * Navega a la vista de detalle del item que acaba de ser editado.
   */
  async navigateToEditedItemDetail(): Promise<void> {
    await this.openFirstMovementActions();
    await this.clickVerItemFromMovements();
  }

  // ─── Exportar ítems ─────────────────────────────────────────

  /**
   * Exporta la lista de ítems a Excel/CSV.
   *
   * Flujo:
   * 1. Abre el menú de opciones (icono ⋮ superior)
   * 2. Registra la promesa de descarga ANTES de clickear "Exportar"
   *    (requisito de Playwright para capturar el evento download)
   * 3. Clickea la opción "Exportar"
   * 4. Retorna el objeto Download para que el spec pueda validar
   *    nombre de archivo, guardarlo en disco, etc.
   *
   * @returns El objeto Download de Playwright con el archivo exportado
   */
  async exportarItems(): Promise<import('@playwright/test').Download> {
    // Registrar la promesa ANTES de cualquier click para evitar race conditions.
    // Si el evento 'download' se dispara antes de waitForEvent(), se pierde.
    const downloadPromise = this.page.waitForEvent('download', { timeout: 30_000 });

    // Abrir menú de opciones (el mismo icono que se usa para carga masiva)
    await this.page
      .locator('[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:options"]')
      .click();

    // Esperar a que la opción "Exportar" sea visible antes de clickear
    const exportarBtn = this.page.locator('[id="lgt_cmp-items_cmp-datos-items.li:exportar-sin-filtro"]');
    await exportarBtn.waitFor({ state: 'visible', timeout: 10_000 });

    // Clickear "Exportar" — dispara la descarga
    await exportarBtn.click();

    return downloadPromise;
  }
}
