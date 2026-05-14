import { Page } from '@playwright/test';
export const TotalEnCarrito =
  (valor: string) =>
  async (page: Page): Promise<boolean> => {
    const total = page
      .locator(".cmp-resumen-pedido div.total div.monto")
      .filter({ hasText: valor })
      .first();
    try {
      await total.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  };