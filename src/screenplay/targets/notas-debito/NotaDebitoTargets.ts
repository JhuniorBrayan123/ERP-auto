import type { Page } from '@playwright/test';


export const NotaDebitoTargets = {
  
  
  



  
  
  

  
  inputCorrelativo: (page: Page) =>
    page.locator(
      '[id="pv_punto-venta_cmp-nota-debito_cmp-header:header_cmp-nd-datos-comprobante_v-input:correlativo"]'
    ),

  
  inputMonto: (page: Page) =>
    page.locator(
      '[id="pv_punto-venta_cmp-nota-debito_cmp-header:header_cmp-nd-datos-comprobante_v-input:monto"]'
    ),

  
  btnBuscar: (page: Page) =>
    page.getByRole('button', { name: /^Buscar$/i }),

  
  
  

  
  selectorTipoNota: (page: Page) =>
    page.locator('div').filter({ hasText: /^Intereses por mora$/ }).nth(3),

  
  opcionInteresMora: (page: Page) =>
    page.getByText('Intereses por mora').nth(1),

  
  opcionAumentoValor: (page: Page) =>
    page.getByText('Aumento en el valor'),

  
  opcionPenalidades: (page: Page) =>
    page.getByText('Penalidades/ otros conceptos'),

  
  
  

  
  inputMotivo: (page: Page) =>
    page.locator(
      '[id="pv_punto-venta_cmp-nota-debito_cmp-nd-datos:datos_v-input:motivo"]'
    ),

  
  
  

  
  btnEditarItem: (page: Page) =>
    page.locator(
      '[id="pv_cm-nota-debito_cmp-nd-grid-items:body-grilla_div:btn-editar-item"]'
    ),

  
  inputMontoItem: (page: Page) =>
    page.locator(
      '[id="pv_cm-nota-debito:nota-debito_cmp-nd-grid-items:body_v-grid:body-grilla_v-input:monto"]'
    ),

  
  btnAceptarItem: (page: Page) =>
    page.locator(
      '[id="pv_cm-nota-debito_cmp-nd-grid-items:body-grilla_div:btn-aceptar-item"]'
    ),

  
  
  

  
  btnEliminarComprobanteVinculado: (page: Page) =>
    page.locator('.card-info-doc > .icon'),

  
  
  

  
  btnEmitir: (page: Page) =>
    page.getByRole('button', { name: /^Emitir$/i }),

  
  gridItems: (page: Page) =>
    page.locator(
      '[id="pv_cmp-nota-credito_cmp-nc-body_cmp-observaciones-totales_v-button:vista-previa_v-grid:body-grilla"]'
    ),
};
