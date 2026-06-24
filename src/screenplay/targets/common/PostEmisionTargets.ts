import type { Page } from '@playwright/test';


export const PostEmisionTargets = {
  
  mensajeExito: (page: Page) => page.getByText('¡Buen trabajo!'),

  
  mensajeEmitidoCorrectamente: (page: Page) =>
    page.getByText(/tu comprobante fue emitido correctamente/i),

  
  btnWhatsApp: (page: Page) => page.getByText('Enviar por WhatsApp'),

  
  btnEmail: (page: Page) => page.getByText('Enviar por Email'),

  
  btnCopiarLink: (page: Page) => page.getByText('Copiar Link'),

  
  btnDescargarXML: (page: Page) => page.getByText('Descargar XML'),

  
  btnDescargarPDF: (page: Page) => page.getByText('Descargar PDF'),

  
  btnImprimirA4: (page: Page) =>
    page.locator('[id="pv_punto-venta_post-emision_v-button:imprimir-a4"]'),

  
  btnImprimirTicket: (page: Page) =>
    page.locator('[id="pv_punto-venta_post-emision_v-button:imprimir-voucher"]'),

  
  btnNuevaVenta: (page: Page) =>
    page.getByRole('button', { name: /nueva venta/i }),

  
  textoNumeroComprobante: (page: Page) =>
    page.getByText(/[A-Z]{1,4}\d{1,4}-\d+/).last(),
};
