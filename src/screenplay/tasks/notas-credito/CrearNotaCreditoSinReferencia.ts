import { expect, type Page } from '@playwright/test';
import { ComprobantePage } from '@pages/PuntoVenta/ComprobantePage';
import type { DatosCliente, ItemVenta } from '@app-types/emision.types';
import { NotaCreditoTargets } from '../../targets/notas-credito/NotaCreditoTargets';
import { LlenarMotivoNotaCredito } from '../../interactions/notas/LlenarMotivoTexto';
import { EmitirNotaCreditoConDevolucion, type ResultadoEmisionNota } from '../../interactions/notas/EmitirNotaCredito';

export interface DatosCrearNotaCreditoSinReferencia {
  /** Cliente al que se le emitirá la nota sin referencia */
  cliente: DatosCliente & { textoSelector?: string };
  /** Ítem que se agregará a la nota */
  item: ItemVenta;
  /** Texto libre del motivo */
  textoMotivo: string;
  /** Tipo de comprobante a referenciar manualmente (Factura/Boleta) */
  tipoComprobanteReferencia: 'Factura' | 'Boleta';
  /** Serie del comprobante de referencia */
  serieReferencia: string;
  /** Correlativo del comprobante de referencia */
  correlativoReferencia: string;
  /** Observaciones adicionales (opcional) */
  observaciones?: string;
}

/**
 * Task: Crear Nota de Crédito SIN Referencia
 *
 * Flujo alternativo al de vinculación:
 * 1. Selecciona tipo comprobante → Nota de Crédito
 * 2. Elige "Emitir nota sin referencia"
 * 3. Llena el motivo
 * 4. Selecciona tipo de comprobante de referencia manual
 * 5. Ingresa serie y correlativo de referencia
 * 6. Emite con retorno
 *
 * NOTA: Este flujo requiere que el cliente ya esté seleccionado en el carrito
 * y que haya ítems agregados ANTES de llamar a este Task.
 */
export const CrearNotaCreditoSinReferencia = (datos: DatosCrearNotaCreditoSinReferencia) => {
  const fn = async (page: Page): Promise<ResultadoEmisionNota> => {

    const comprobantePage = new ComprobantePage(page);

    await comprobantePage.seleccionarNotaCredito();

    await NotaCreditoTargets.btnEmitirSinReferencia(page).click();

    await LlenarMotivoNotaCredito(datos.textoMotivo)(page);

    const inputCliente = NotaCreditoTargets.inputBusquedaClienteSinRef(page);
    await inputCliente.click();
    await inputCliente.fill(datos.cliente.documento);
    await page.waitForTimeout(800); // Wait for debounce
    await page.getByText(datos.cliente.textoSelector || datos.cliente.nombre).click();


    await NotaCreditoTargets.selectorFacturaSinRef(page).click();
    await NotaCreditoTargets.opcionFacturaSinRef(page).click();


    const inputSerie = NotaCreditoTargets.inputSerieReferencia(page);
    await inputSerie.click();
    await inputSerie.fill(datos.serieReferencia);

    const inputCorrelativo = NotaCreditoTargets.inputCorrelativoReferencia(page);
    await inputCorrelativo.click();
    await inputCorrelativo.fill(datos.correlativoReferencia);

    const inputItem = NotaCreditoTargets.inputBusquedaItemSinRef(page);
    await inputItem.click();
    await inputItem.fill(datos.item.codigo);
    await page.waitForTimeout(800); // Wait for debounce
    await page.getByText(datos.item.nombre).click();

    return EmitirNotaCreditoConDevolucion()(page);
  };

  fn.displayName = `Crear NC sin referencia: ref ${datos.serieReferencia}-${datos.correlativoReferencia}`;
  return fn;
};
