import type { Page } from '@playwright/test';

/**
 * Targets específicos del formulario de Nota de Débito.
 * Locators extraídos del Codegen y estabilizados.
 */
export const NotaDebitoTargets = {
  // ──────────────────────────────────────────────
  // Selector de tipo de comprobante en header
  // ──────────────────────────────────────────────



  // ──────────────────────────────────────────────
  // Datos del comprobante a vincular (en formulario ND, diferente a NC)
  // ──────────────────────────────────────────────

  /** Input de correlativo en el formulario ND (sin modal separado como NC) */
  inputCorrelativo: (page: Page) =>
    page.locator(
      '[id="pv_punto-venta_cmp-nota-debito_cmp-header:header_cmp-nd-datos-comprobante_v-input:correlativo"]'
    ),

  /** Input de monto de la nota de débito */
  inputMonto: (page: Page) =>
    page.locator(
      '[id="pv_punto-venta_cmp-nota-debito_cmp-header:header_cmp-nd-datos-comprobante_v-input:monto"]'
    ),

  /** Botón Buscar comprobante en formulario ND */
  btnBuscar: (page: Page) =>
    page.getByRole('button', { name: /^Buscar$/i }),

  // ──────────────────────────────────────────────
  // Tipo (motivo) de ND
  // ──────────────────────────────────────────────

  /** Contenedor del selector de tipo de nota de débito */
  selectorTipoNota: (page: Page) =>
    page.locator('div').filter({ hasText: /^Intereses por mora$/ }).nth(3),

  /** Opción "Intereses por mora" */
  opcionInteresMora: (page: Page) =>
    page.getByText('Intereses por mora').nth(1),

  /** Opción "Aumento en el valor" */
  opcionAumentoValor: (page: Page) =>
    page.getByText('Aumento en el valor'),

  /** Opción "Penalidades/ otros conceptos" */
  opcionPenalidades: (page: Page) =>
    page.getByText('Penalidades/ otros conceptos'),

  // ──────────────────────────────────────────────
  // Motivo (texto libre)
  // ──────────────────────────────────────────────

  /** Input de motivo de la nota de débito */
  inputMotivo: (page: Page) =>
    page.locator(
      '[id="pv_punto-venta_cmp-nota-debito_cmp-nd-datos:datos_v-input:motivo"]'
    ),

  // ──────────────────────────────────────────────
  // Grid de ítems ND (para "Aumento en el valor")
  // ──────────────────────────────────────────────

  /** Botón editar ítem en grid ND */
  btnEditarItem: (page: Page) =>
    page.locator(
      '[id="pv_cm-nota-debito_cmp-nd-grid-items:body-grilla_div:btn-editar-item"]'
    ),

  /** Input de monto del ítem en edición */
  inputMontoItem: (page: Page) =>
    page.locator(
      '[id="pv_cm-nota-debito:nota-debito_cmp-nd-grid-items:body_v-grid:body-grilla_v-input:monto"]'
    ),

  /** Botón aceptar ítem editado */
  btnAceptarItem: (page: Page) =>
    page.locator(
      '[id="pv_cm-nota-debito_cmp-nd-grid-items:body-grilla_div:btn-aceptar-item"]'
    ),

  // ──────────────────────────────────────────────
  // Referencia cargada / card del comprobante vinculado
  // ──────────────────────────────────────────────

  /** Icono de eliminar la card del comprobante vinculado */
  btnEliminarComprobanteVinculado: (page: Page) =>
    page.locator('.card-info-doc > .icon'),

  // ──────────────────────────────────────────────
  // Botón emitir
  // ──────────────────────────────────────────────

  /** Botón "Emitir" de la nota de débito */
  btnEmitir: (page: Page) =>
    page.getByRole('button', { name: /^Emitir$/i }),

  /** Grid de ítems del comprobante vinculado en ND */
  gridItems: (page: Page) =>
    page.locator(
      '[id="pv_cmp-nota-credito_cmp-nc-body_cmp-observaciones-totales_v-button:vista-previa_v-grid:body-grilla"]'
    ),
};
