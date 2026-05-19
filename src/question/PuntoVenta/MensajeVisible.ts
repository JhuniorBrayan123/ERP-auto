import { Page } from "@playwright/test";

/**
 * Question genérica: ¿el texto dado es visible en la página?
 * Cubre expects como: "Operaciones Gravadas16.95", "Total4 ítems", "0.00", etc.
 */
export const MensajeVisible =
  (texto: string, opciones?: { exact?: boolean }) =>
  async (page: Page): Promise<boolean> => {
    const locator = page.getByText(texto, opciones).first();
    try {
      await locator.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  };