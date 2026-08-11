import { Page } from "@playwright/test";

/**
 * Verifica que UNO de los textos indicados sea visible en la página.
 * Acepta un único texto (compat con usos existentes) o un array de
 * alternativas (devuelve true si al menos una aparece — útil cuando el
 * mensaje del back puede variar según el estado del ítem).
 */
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
        // continúa con la siguiente alternativa
      }
    }
    return false;
  };