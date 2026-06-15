import type { Page } from '@playwright/test';

/**
 * Targets comunes para el modal post-emisión (Buen trabajo!).
 * Compartidos entre NC, ND y cualquier comprobante de PuntoVenta.
 */
export const PostEmisionTargets = {
  /** Mensaje de éxito principal */
  mensajeExito: (page: Page) => page.getByText('¡Buen trabajo!'),

  /** Mensaje "Tu comprobante fue emitido correctamente" */
  mensajeEmitidoCorrectamente: (page: Page) =>
    page.getByText(/tu comprobante fue emitido correctamente/i),

  /** Opción Enviar por WhatsApp */
  btnWhatsApp: (page: Page) => page.getByText('Enviar por WhatsApp'),

  /** Opción Enviar por Email */
  btnEmail: (page: Page) => page.getByText('Enviar por Email'),

  /** Opción Copiar Link */
  btnCopiarLink: (page: Page) => page.getByText('Copiar Link'),

  /** Opción Descargar XML */
  btnDescargarXML: (page: Page) => page.getByText('Descargar XML'),

  /** Opción Descargar PDF */
  btnDescargarPDF: (page: Page) => page.getByText('Descargar PDF'),

  /** Botón Imprimir A4 */
  btnImprimirA4: (page: Page) =>
    page.locator('[id="pv_punto-venta_post-emision_v-button:imprimir-a4"]'),

  /** Botón Imprimir Ticket/Voucher */
  btnImprimirTicket: (page: Page) =>
    page.locator('[id="pv_punto-venta_post-emision_v-button:imprimir-voucher"]'),

  /** Botón "Nueva Venta" para continuar */
  btnNuevaVenta: (page: Page) =>
    page.getByRole('button', { name: /nueva venta/i }),

  /** Regex para capturar el número de comprobante (ej. FC01-00000001) */
  textoNumeroComprobante: (page: Page) =>
    page.getByText(/[A-Z]{1,4}\d{1,4}-\d+/).last(),
};
