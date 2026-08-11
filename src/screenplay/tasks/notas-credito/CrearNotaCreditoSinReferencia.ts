import { expect, type Page } from '@playwright/test';
import { ComprobantePage } from '@pages/PuntoVenta/ComprobantePage';
import type { DatosCliente, ItemVenta } from '@app-types/emision.types';
import { NotaCreditoTargets } from '../../targets/notas-credito/NotaCreditoTargets';
import { LlenarMotivoNotaCredito } from '../../interactions/notas/LlenarMotivoTexto';
import { EmitirNotaCreditoConDevolucion, type ResultadoEmisionNota } from '../../interactions/notas/EmitirNotaCredito';

export interface DatosCrearNotaCreditoSinReferencia {
  
  cliente: DatosCliente & { textoSelector?: string };
  
  item: ItemVenta;
  
  textoMotivo: string;
  
  tipoComprobanteReferencia: 'Factura' | 'Boleta';
  
  serieReferencia: string;
  
  correlativoReferencia: string;
  
  observaciones?: string;
}


export const CrearNotaCreditoSinReferencia = (datos: DatosCrearNotaCreditoSinReferencia) => {
  const fn = async (page: Page): Promise<ResultadoEmisionNota> => {

    const comprobantePage = new ComprobantePage(page);

    await comprobantePage.seleccionarNotaCredito();

    await NotaCreditoTargets.btnEmitirSinReferencia(page).click();

    await LlenarMotivoNotaCredito(datos.textoMotivo)(page);

    const inputCliente = NotaCreditoTargets.inputBusquedaClienteSinRef(page);
    await inputCliente.click();
    await inputCliente.fill(datos.cliente.documento);
    await page.waitForTimeout(800); 
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
    await page.waitForTimeout(800); 
    await page.getByText(datos.item.nombre).click();

    return EmitirNotaCreditoConDevolucion()(page);
  };

  fn.displayName = `Crear NC sin referencia: ref ${datos.serieReferencia}-${datos.correlativoReferencia}`;
  return fn;
};
