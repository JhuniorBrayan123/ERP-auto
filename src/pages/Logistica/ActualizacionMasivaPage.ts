import { type Page, type Locator } from '@playwright/test';
import {
  mapColumnByFileHeader as applyColumnMapping,
  waitForColumnAssignmentStep,
} from '../../helpers/Logistica/column-mapping.helper';
import type { ColumnMappingRule } from '../../helpers/Logistica/actualizacion-masiva-config.helper';

/**
 * Wizard de actualización masiva (datos o stock). Separado de {@link CargaMasivaPage} (creación).
 */
export class ActualizacionMasivaPage {
  constructor(private readonly page: Page) {}

  private get menuOpciones(): Locator {
    return this.page.locator(
      '[id="lgt_cmp-items_cmp-datos-items.cmp-option-button:options"]',
    );
  }

  private get opcionActualizarMasiva(): Locator {
    return this.page.locator(
      '[id="lgt_cmp-items_cmp-datos-items.li:actualizar-masiva"]',
    );
  }

  private get botonCerrarPopup(): Locator {
    return this.page.locator('.popup-container > .button-close > .icon');
  }

  private get areaOverscreen(): Locator {
    return this.page.locator('.cmp-overscreen.is-open > .area');
  }

  private get inputArchivo(): Locator {
    return this.page.locator('input[type="file"]');
  }

  private get botonProcesar(): Locator {
    return this.page.getByText('Procesar');
  }

  /** Mismo patrón que {@link botonSiguienteWizard}: suele ser capa clicable, no `<button>`. */
  private botonIrAlInicioWizard(): Locator {
    return this.page.getByText('Ir al inicio', { exact: true }).last();
  }

  /**
   * "Siguiente" en el wizard no siempre expone `role="button"` (suele ser div/capa clicable).
   * `getByRole('button', { name: 'Siguiente' })` hace timeout; se usa texto exacto.
   * Si hay varios nodos en el DOM, el del pie del flujo suele ser el último.
   */
  private botonSiguienteWizard(): Locator {
    return this.page.getByText('Siguiente', { exact: true }).last();
  }

  async abrirActualizacionMasiva(): Promise<void> {
    await this.menuOpciones.click();
    await this.opcionActualizarMasiva.click();
    await this.botonCerrarPopup.click().catch(() => {});
    await this.areaOverscreen.click().catch(() => {});
  }

  async waitForTipoActualizacionStep(): Promise<void> {
    await this.page
      .getByText(/Actualizar datos de ítems/i)
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });
  }

  async waitForSeleccionTipoItemStep(): Promise<void> {
    await this.page
      .getByText(/Selección de tipo de ítems|tipo de ítem/i)
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 })
      .catch(async () => {
        await this.page
          .locator('.cmp-card-item')
          .first()
          .waitFor({ state: 'visible', timeout: 10_000 });
      });
  }

  async waitForUploadStep(): Promise<void> {
    await this.inputArchivo.waitFor({ state: 'attached', timeout: 15_000 });
  }

  async waitForFinishStep(): Promise<void> {
    await this.botonIrAlInicioWizard().waitFor({ state: 'visible', timeout: 60_000 });
  }

  /**
   * Elige "Actualizar datos de ítems".
   * En esta pantalla el título y la descripción van pegados ("ítemsActualiza…");
   * no hay el mismo patrón card + botón "Seleccionar" que en creación masiva.
   */
  async seleccionarActualizarDatosItems(): Promise<void> {
    await this.page
      .getByText(
        /Actualizar datos de ítems\s*Actualiza los datos de tus ítems según tus/i,
      )
      .first()
      .click();
  }

  /**
   * Elige "Actualizar stock de ítems" (misma interacción por texto unido).
   */
  async seleccionarActualizarStockItems(): Promise<void> {
    await this.page
      .getByText(
        /Actualizar stock de ítems\s*Actualiza los stock de tus ítems según tus/i,
      )
      .first()
      .click();
  }

  async clickSiguiente(): Promise<void> {
    const btn = this.botonSiguienteWizard();
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.click();
  }

  /**
   * Producto / Servicio / Insumo: en actualización masiva suele mostrarse el texto
   * pegado "ProductosSeleccionar¿Qué es…"; si no, se intenta el botón de la card.
   */
  async seleccionarTipoItem(cardLabel: string): Promise<void> {
    const escaped = cardLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const mergedText = this.page.getByText(new RegExp(`${escaped}Seleccionar`, 'i'));
    if (await mergedText.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await mergedText.first().click();
      return;
    }
    const card = this.page
      .locator('.cmp-card-item')
      .filter({ has: this.page.getByText(cardLabel, { exact: true }) });
    await card.getByRole('button', { name: 'Seleccionar' }).click();
  }

  async subirArchivo(filePath: string): Promise<void> {
    await this.inputArchivo.setInputFiles(filePath);
    await this.page
      .getByText('Archivo subido correctamente')
      .waitFor({ state: 'visible', timeout: 20_000 });
  }

  async aplicarMapeosColumnas(rules: ColumnMappingRule[]): Promise<void> {
    if (rules.length === 0) return;
    await waitForColumnAssignmentStep(this.page);
    for (const r of rules) {
      await applyColumnMapping(this.page, r.fileHeader, r.systemTarget);
    }
  }

  private async avanzarTrasSubidaStockHastaAlmacenes(): Promise<void> {
    await this.clickSiguiente();
    const almacen0 = this.page.locator(
      '[id="lgt_items_actualizacion-masivo_cmp-asignacion-almacenes:almacen_v-checkbox:elegir-almacen-0"]',
    );
    try {
      await almacen0.waitFor({ state: 'visible', timeout: 8_000 });
    } catch {
      await this.clickSiguiente();
      await almacen0.waitFor({ state: 'visible', timeout: 20_000 });
    }
  }

  async clickProcesar(): Promise<void> {
    await this.botonProcesar.click();
  }

  async clickIrAlInicio(): Promise<void> {
    const btn = this.botonIrAlInicioWizard();
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Asignación de almacén en flujo de stock (IDs estables del ERP).
   * @param index 0-based según `elegir-almacen-{index}` del codegen.
   */
  async seleccionarAlmacenStockPorIndice(index: number): Promise<void> {
    const id = `lgt_items_actualizacion-masivo_cmp-asignacion-almacenes:almacen_v-checkbox:elegir-almacen-${index}`;
    await this.page.locator(`[id="${id}"]`).click();
  }


  async ejecutarActualizacionDatosItem(
    cardLabel: string,
    filePath: string,
    rules: ColumnMappingRule[],
  ): Promise<void> {
    await this.waitForTipoActualizacionStep();
    await this.seleccionarActualizarDatosItems();
    await this.clickSiguiente();
    await this.waitForSeleccionTipoItemStep();
    await this.seleccionarTipoItem(cardLabel);
    await this.clickSiguiente();
    await this.waitForUploadStep();
    await this.subirArchivo(filePath);
    await this.clickSiguiente();
    await this.aplicarMapeosColumnas(rules);
    // En algunos entornos el paso de mapeo no requiere "Siguiente" (se procesa desde el mismo paso).
    // Si existe, avanzamos; si no, continuamos a "Procesar".
    if (rules.length > 0) {
      const btn = this.botonSiguienteWizard();
      if (await btn.isVisible().catch(() => false)) {
        await this.clickSiguiente();
      }
    }
    await this.clickProcesar();
    await this.waitForFinishStep();
  }


  async ejecutarActualizacionStock(
    filePath: string,
    almacenIndex: number,
  ): Promise<void> {
    await this.waitForTipoActualizacionStep();
    await this.seleccionarActualizarStockItems();
    await this.clickSiguiente();
    await this.waitForUploadStep();
    await this.subirArchivo(filePath);
    await this.avanzarTrasSubidaStockHastaAlmacenes();
    await this.seleccionarAlmacenStockPorIndice(almacenIndex);
    await this.clickProcesar();
    await this.waitForFinishStep();
  }
}
