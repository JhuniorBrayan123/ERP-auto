import { expect, type Page } from '@playwright/test';
import { PostEmisionTargets } from '../../targets/common/PostEmisionTargets';


export const ModalPostEmisionVisible = () => {
  const fn = async (page: Page): Promise<void> => {
    await expect(PostEmisionTargets.mensajeExito(page)).toBeVisible();
    await expect(PostEmisionTargets.btnWhatsApp(page)).toBeVisible();
    await expect(PostEmisionTargets.btnEmail(page)).toBeVisible();
    await expect(PostEmisionTargets.btnDescargarXML(page)).toBeVisible();
    await expect(PostEmisionTargets.btnDescargarPDF(page)).toBeVisible();
    await expect(PostEmisionTargets.btnImprimirA4(page)).toContainText('Imprimir');
    await expect(PostEmisionTargets.btnImprimirTicket(page)).toContainText('Imprimir Ticket');
  };

  fn.displayName = 'Verificar modal post-emisión completo';
  return fn;
};


export const NumeroComprobanteEmitido = () => {
  const fn = async (page: Page): Promise<string> => {
    
    const regex = /[A-Z]{1,4}\d{1,4}-\d+/;
    const locator = page.getByText(regex).last();
    const texto = await locator.innerText();
    const match = texto.match(regex);
    return match ? match[0] : '';
  };

  fn.displayName = 'Obtener número de comprobante del modal';
  return fn;
};
