import {Page} from "@playwright/test";

export const FilaEnTotales =
    (label: string, valor: string) =>
        async (page: Page): Promise<boolean> => {
            const fila = page
                .locator(".cmp-totales-comprobante .cuerpo div.texto")
                .filter({hasText: label})
                .filter({hasText: valor})
                .first();
            try {
                await fila.waitFor({state: "visible", timeout: 5000});
                return true;
            } catch {
                return false;
            }
        };

export const CalculosTotales =
    (label: string, valor: string) =>
        async (page: Page): Promise<boolean> => {
            // ── DEBUG: dump all rows in .cmp-resumen-pedido ──
            console.log(`[CalculosTotales] Buscando: label="${label}", valor="${valor}"`);
            const allRows = await page.locator(".cmp-resumen-pedido .content div.subtotal").all();
            console.log(`[CalculosTotales] Filas encontradas: ${allRows.length}`);
            for (let i = 0; i < allRows.length; i++) {
                const spans = await allRows[i].locator("span.v-text").all();
                const texts: string[] = [];
                for (const s of spans) {
                    texts.push((await s.textContent())?.trim() ?? "");
                }
                console.log(`[CalculosTotales]   fila[${i}]: ${JSON.stringify(texts)}`);
            }
            // ── END DEBUG ──

            const fila = page
                .locator(".cmp-resumen-pedido .content div.subtotal")
                .filter({hasText: label})
                .filter({hasText: valor})
                .first();
            try {
                await fila.waitFor({state: "visible", timeout: 5000});
                console.log(`[CalculosTotales]  Match encontrado para "${label}" / "${valor}"`);
                return true;
            } catch {
                console.log(`[CalculosTotales]  No match para "${label}" / "${valor}"`);
                return false;
            }
        };
