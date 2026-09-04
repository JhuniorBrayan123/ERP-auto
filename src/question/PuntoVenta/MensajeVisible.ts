import { Page } from "@playwright/test";


export const MensajeVisible =
  (texto: string | string[], opciones?: { exact?: boolean }) =>
  async (page: Page): Promise<boolean> => {
    const textos = Array.isArray(texto) ? texto : [texto];
    for (const t of textos) {
      const locator = page.getByText(t, opciones).first();
      try {
        await locator.waitFor({ state: "visible", timeout: 10000 });
        return true;
      } catch {
        
      }
    }
    return false;
  };