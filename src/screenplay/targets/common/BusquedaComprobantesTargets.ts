import type { Page } from '@playwright/test';

/**
 * Targets comunes para la pantalla de Búsqueda de Comprobantes.
 * Se complementan con el Page Object BusquedaComprobantesPage existente.
 */
export const BusquedaComprobantesTargets = {
  /** Botón "Ver Filtros Avanzados" */
  btnFiltrosAvanzados: (page: Page) =>
    page.getByRole('button', { name: /ver filtros avanzados|ver filtros/i }),

  /** Dropdown de Tipo de comprobante */
  selectorTipoComprobante: (page: Page) =>
    page.locator('div').filter({ hasText: /^Tipo de comprobante$/ }).nth(2),

  /** Opción "Nota de Crédito" en el filtro */
  opcionNotaCredito: (page: Page) =>
    page.getByText('Nota de Crédito', { exact: true }),

  /** Opción "Nota de Débito" en el filtro */
  opcionNotaDebito: (page: Page) =>
    page.getByText('Nota de Débito', { exact: true }),

  /** Input de correlativo en filtros */
  inputCorrelativo: (page: Page) =>
    page.getByRole('textbox', { name: /correlativo/i }),

  /** Botón de opciones de la primera fila de la grilla */
  dropdownPrimerComprobante: (page: Page) =>
    page.locator('.body-options > .cmp-dropdown').first(),

  /** Link "Ver comprobante" en el dropdown */
  linkVerComprobante: (page: Page) =>
    page.getByRole('link', { name: /ver comprobante/i }),

  /** Texto de tipo "Nota de crédito electrónica" en la vista detalle */
  tituloNotaCreditoDetalle: (page: Page) =>
    page.getByText('Nota de crédito electrónica'),

  /** Texto de tipo "Nota de débito electrónica" en la vista detalle */
  tituloNotaDebitoDetalle: (page: Page) =>
    page.getByText('Nota de débito electrónica'),

  /** Texto "Comprobante vinculado" en la vista detalle */
  textoComprobanteVinculado: (page: Page) =>
    page.getByText('Comprobante vinculado'),

  /** Texto "SIN REFERENCIA" en la vista detalle */
  textoSinReferencia: (page: Page) =>
    page.getByText('SIN REFERENCIA'),

  /** Contenedor principal de la vista detalle del comprobante */
  contenedorDetalleComprobante: (page: Page) =>
    page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),

  /** Botón Bitácora en el dropdown de acciones */
  btnBitacora: (page: Page) => page.getByText('Bitácora'),

  /** Botón cerrar del drape/panel de bitácora */
  btnCerrarBitacora: (page: Page) =>
    page.locator('.drape.is-open > .button-close > .icon'),

  /** Botón Salir en la vista detalle */
  btnSalir: (page: Page) => page.getByRole('button', { name: /salir/i }),
};
