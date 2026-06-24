import { expect, type Page } from '@playwright/test';
import { ComprobantePage } from '@pages/PuntoVenta/ComprobantePage';
import { NotaDebitoTargets } from '../../targets/notas-debito/NotaDebitoTargets';
import { SeleccionarMotivoNotaDebito, type MotivoNotaDebito } from '../../interactions/notas/SeleccionarMotivoNotaDebito';
import { LlenarMotivoNotaDebito } from '../../interactions/notas/LlenarMotivoTexto';
import { EmitirNotaDebitoConPago, type ResultadoEmisionNota } from '../../interactions/notas/EmitirNotaDebito';

export type { ResultadoEmisionNota };

export interface DatosCrearNotaDebitoVinculada {
  
  tipoDocumento: 'Factura' | 'Boleta';
  
  serie: string;
  
  correlativo: string;
  
  motivo: MotivoNotaDebito;
  
  textoMotivo: string;
  
  monto?: string;
  
  montoPorItem?: string;
}


export const CrearNotaDebitoConVinculacion = (datos: DatosCrearNotaDebitoVinculada) => {
  const fn = async (page: Page): Promise<ResultadoEmisionNota> => {

    const comprobantePage = new ComprobantePage(page);
    await comprobantePage.seleccionarNotaDebito();


    await expect(page.getByText(/nueva nota de débito/i)).toBeVisible({ timeout: 10_000 });


    const selectorTipoDoc = page.locator('div').filter({ hasText: /^Factura$/ }).nth(2);
    await selectorTipoDoc.click();

    if (datos.tipoDocumento === 'Boleta') {
      await page.getByText('Boleta', { exact: true }).click();
    } else {
      await page.getByText('Factura').nth(2).click();
    }


    const selectorSerie = page.locator('div').filter({ hasText: new RegExp(`^${datos.serie}$`) }).nth(3);
    await selectorSerie.click();
    await page.getByText(datos.serie).nth(1).click();


    const inputCorrelativo = NotaDebitoTargets.inputCorrelativo(page);
    await inputCorrelativo.click();
    await inputCorrelativo.fill(datos.correlativo);


    await NotaDebitoTargets.btnBuscar(page).click();


    await expect(NotaDebitoTargets.gridItems(page)).toBeVisible({ timeout: 15_000 });


    await SeleccionarMotivoNotaDebito(datos.motivo)(page);


    await LlenarMotivoNotaDebito(datos.textoMotivo)(page);


    if (datos.monto && datos.motivo !== 'Aumento en el valor') {

      const inputMonto = NotaDebitoTargets.inputMonto(page);
      await inputMonto.click();
      await inputMonto.fill(datos.monto);
    } else if (datos.montoPorItem && datos.motivo === 'Aumento en el valor') {

      await NotaDebitoTargets.btnEditarItem(page).click();
      const inputMontoItem = NotaDebitoTargets.inputMontoItem(page);
      await inputMontoItem.click();
      await inputMontoItem.fill(datos.montoPorItem);
      await NotaDebitoTargets.btnAceptarItem(page).click();
    }


    return EmitirNotaDebitoConPago()(page);
  };

  fn.displayName = `Crear ND ${datos.motivo} desde ${datos.tipoDocumento} ${datos.serie}-${datos.correlativo}`;
  return fn;
};
