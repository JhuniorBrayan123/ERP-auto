import type { Page } from '@playwright/test';


export const BusquedaComprobantesTargets = {
  
  btnFiltrosAvanzados: (page: Page) =>
    page.getByRole('button', { name: /ver filtros avanzados|ver filtros/i }),

  
  selectorTipoComprobante: (page: Page) =>
    page.locator('div').filter({ hasText: /^Tipo de comprobante$/ }).nth(2),

  
  opcionNotaCredito: (page: Page) =>
    page.getByText('Nota de Crédito', { exact: true }),

  
  opcionNotaDebito: (page: Page) =>
    page.getByText('Nota de Débito', { exact: true }),

  
  inputCorrelativo: (page: Page) =>
    page.getByRole('textbox', { name: /correlativo/i }),

  
  dropdownPrimerComprobante: (page: Page) =>
    page.locator('.body-options > .cmp-dropdown').first(),

  
  linkVerComprobante: (page: Page) =>
    page.getByRole('link', { name: /ver comprobante/i }),

  
  tituloNotaCreditoDetalle: (page: Page) =>
    page.getByText('Nota de crédito electrónica'),

  
  tituloNotaDebitoDetalle: (page: Page) =>
    page.getByText('Nota de débito electrónica'),

  
  textoComprobanteVinculado: (page: Page) =>
    page.getByText('Comprobante vinculado'),

  
  textoSinReferencia: (page: Page) =>
    page.getByText('SIN REFERENCIA'),

  
  contenedorDetalleComprobante: (page: Page) =>
    page.locator('[id="single-spa-application:@sreasons/erp-mf-punto-venta"]'),

  
  btnBitacora: (page: Page) => page.getByText('Bitácora'),

  
  btnCerrarBitacora: (page: Page) =>
    page.locator('.drape.is-open > .button-close > .icon'),

  
  btnSalir: (page: Page) => page.getByRole('button', { name: /salir/i }),
};
