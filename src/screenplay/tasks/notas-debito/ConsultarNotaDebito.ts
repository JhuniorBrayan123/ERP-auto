import {expect, type Page} from '@playwright/test';
import {BusquedaComprobantesTargets} from '../../targets/common/BusquedaComprobantesTargets';


export const ConsultarNotaDebito = (correlativo: string) => {
    const fn = async (page: Page): Promise<void> => {

        await BusquedaComprobantesTargets.btnFiltrosAvanzados(page).click();
        await BusquedaComprobantesTargets.selectorTipoComprobante(page).click();
        await BusquedaComprobantesTargets.opcionNotaDebito(page).click();

        const inputCorrelativo = BusquedaComprobantesTargets.inputCorrelativo(page);
        await inputCorrelativo.click();
        await inputCorrelativo.fill(correlativo);
        await inputCorrelativo.press('Enter');

        await expect(
            page.locator('.body-options').first()
        ).toBeVisible({timeout: 15_000});
    };

    fn.displayName = `Consultar nota de débito con correlativo ${correlativo}`;
    return fn;
};


export const VerDetalleNotaDebito = () => {
  const fn = async (page: Page): Promise<Page> => {
    await BusquedaComprobantesTargets.dropdownPrimerComprobante(page).click();
    const popupPromise = page.waitForEvent('popup');
    await BusquedaComprobantesTargets.linkVerComprobante(page).click();
    const popup = await popupPromise;

    await expect(
      BusquedaComprobantesTargets.tituloNotaDebitoDetalle(popup)
    ).toBeVisible({ timeout: 20_000 });
    return popup;
  };

  fn.displayName = 'Ver detalle de nota de débito';
  return fn;
};
