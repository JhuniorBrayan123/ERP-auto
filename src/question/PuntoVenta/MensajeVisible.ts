import { Page } from "@playwright/test";

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