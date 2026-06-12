import type { Page } from '@playwright/test';

/**
 * Targets para el modal de búsqueda y vinculación de comprobante origen.
 * Usado tanto en Nota de Crédito como en Nota de Débito.
 */
export const VincularComprobanteTargets = {
  /** Botón que abre el modal de vinculación en la pantalla NC */
  btnVincularComprobante: (page: Page) =>
    page.getByRole('button', { name: /vincular comprobante/i }),

  /** Selector de tipo de documento (Factura / Boleta) dentro del modal */
  selectorTipoDocumento: (page: Page) =>
    page.locator('div').filter({ hasText: /^Selecciona serie$/ }).nth(1),

  /** Opción Factura en el dropdown de tipo de documento */
  opcionFactura: (page: Page) =>
    page.getByRole('button', { name: /^Factura$/i }),

  /** Opción Boleta en el dropdown de tipo de documento */
  opcionBoleta: (page: Page) =>
    page.getByRole('button', { name: /^Boleta$/i }),

  /** Opción dinámica por tipo de documento (evita if/else en la interaction) */
  opcionTipoDocumento: (page: Page, tipoDocumento: string) =>
    page.getByRole('button', { name: new RegExp(`^${tipoDocumento}$`, 'i') }),

  /** Input de correlativo en el modal de búsqueda */
  inputCorrelativo: (page: Page) =>
    page.getByRole('textbox', { name: /ej\./i }),

  /** Botón Buscar dentro del modal */
  btnBuscar: (page: Page) =>
    page.getByRole('button', { name: /^Buscar$/i }),

  /** Sección con los datos cargados del comprobante encontrado */
  datosComprobanteCargado: (page: Page) =>
    page.getByText(/datos del comprobante a/i),

  /** Botón confirmar vinculación en modal NC */
  btnVincularYCrearNC: (page: Page) =>
    page.getByRole('button', { name: /vincular y crear nota de cr[eé]/i }),

  /** Área de texto con el mensaje de comprobante no encontrado */
  mensajeNoEncontrado: (page: Page) =>
    page.getByText(/no se encontró el comprobante con los datos ingresados/i),
};
