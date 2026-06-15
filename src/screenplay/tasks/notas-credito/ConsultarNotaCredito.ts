import { expect, type Page } from '@playwright/test';
import { BusquedaComprobantesTargets } from '../../targets/common/BusquedaComprobantesTargets';

export interface ResultadoConsultaNC {
  /** Número de comprobante encontrado en la grilla */
  visible: boolean;
  /** Tipo confirmado en detalle */
  tipoDocumento: string;
  /** Tiene comprobante vinculado */
  tieneComprobanteVinculado: boolean;
}

/**
 * Task: Consultar Nota de Crédito en Búsqueda de Comprobantes
 *
 * Navega a la pantalla de búsqueda, filtra por tipo NC y correlativo,
 * y retorna información básica del resultado.
 *
 * Usa el BusquedaComprobantesPage existente para la navegación
 * (reutilización inteligente de lo ya construido).
 */
export const ConsultarNotaCredito = (correlativo: string) => {
  const fn = async (page: Page): Promise<void> => {

    await page.locator('.icon').first().click();
    await page.getByText('Ventas y compras').click();
    await page.getByText('Búsqueda de comprobantes').click();


    await BusquedaComprobantesTargets.btnFiltrosAvanzados(page).click();
    await BusquedaComprobantesTargets.selectorTipoComprobante(page).click();
    await BusquedaComprobantesTargets.opcionNotaCredito(page).click();

    const inputCorrelativo = BusquedaComprobantesTargets.inputCorrelativo(page);
    await inputCorrelativo.click();
    await inputCorrelativo.fill(correlativo);
    await inputCorrelativo.press('Enter');


    await expect(
      page.locator('.body-options').first()
    ).toBeVisible({ timeout: 15_000 });
  };

  fn.displayName = `Consultar nota de crédito con correlativo ${correlativo}`;
  return fn;
};

/**
 * Task: Ver Detalle de Nota de Crédito (abre popup)
 * Retorna la instancia de la página popup para hacer assertions.
 */
export const VerDetalleNotaCredito = () => {
  const fn = async (page: Page): Promise<Page> => {
    await BusquedaComprobantesTargets.dropdownPrimerComprobante(page).click();
    const popupPromise = page.waitForEvent('popup');
    await BusquedaComprobantesTargets.linkVerComprobante(page).click();
    const popup = await popupPromise;

    await expect(
      BusquedaComprobantesTargets.tituloNotaCreditoDetalle(popup)
    ).toBeVisible({ timeout: 20_000 });
    return popup;
  };

  fn.displayName = 'Ver detalle de nota de crédito';
  return fn;
};
