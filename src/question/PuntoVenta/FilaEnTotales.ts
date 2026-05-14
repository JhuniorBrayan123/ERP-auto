import { Page } from "@playwright/test";

export const FilaEnTotales =
  (label: string, valor: string) =>
  async (page: Page): Promise<boolean> => {
    const fila = page
      .locator(".cmp-totales-comprobante .cuerpo div.texto")
      .filter({ hasText: label })
      .filter({ hasText: valor })
      .first();
    try {
      await fila.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  };

export const CalculosTotales =
  (label: string, valor: string) =>
  async (page: Page): Promise<boolean> => {
    const fila = page
      .locator(".cmp-resumen-pedido .content div.subtotal")
      .filter({ hasText: label })
      .filter({ hasText: valor })
      .first();
    try {
      await fila.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  };
