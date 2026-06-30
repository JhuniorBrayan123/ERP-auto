import { expect, type Page } from '@playwright/test';
import { MenuCajaTargets } from '@screenplay/targets/caja/MenuCajaTargets';
import { CierreCajaTargets } from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import { esperarCargaOverlay } from '@utils/wait-helpers';

const MAX_INTENTOS = 3;

// ─── Helpers internos ─────────────────────────────────────────────────────────

async function estaEnCierreDeCaja(page: Page): Promise<boolean> {
    return CierreCajaTargets.tituloCajaVenta(page)
        .isVisible({ timeout: 4_000 })
        .catch(() => false);
}

// ─── Task: IrACierreDeCaja ────────────────────────────────────────────────────
/**
 * Navega al módulo "Cierre de caja" con reintentos automáticos.
 *
 * El ERP a veces no completa la navegación en el primer click (overload lento,
 * menú que no reacciona, etc.). Esta Task reintenta hasta MAX_INTENTOS veces:
 *
 * Por intento:
 *  1. Abre el menú lateral (si el menú ya está abierto el click lo cierra y lo reabre)
 *  2. Hace click en "Cierre de caja"
 *  3. Espera el overload
 *  4. Verifica si el título de cierre de caja es visible
 *  5. Si no → reintenta
 */
export const IrACierreDeCaja = () => {
    const fn = async (page: Page): Promise<void> => {
        let llegamos = false;

        for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
            // Cerrar el menú si quedó abierto del intento anterior
            const menuAbierto = await MenuCajaTargets.opcionCierreCaja(page)
                .isVisible({ timeout: 1_000 })
                .catch(() => false);

            if (!menuAbierto) {
                await MenuCajaTargets.btnAbrirMenu(page).click();
                // Pequeña pausa para que el menú se estabilice
                await page.waitForTimeout(500);
            }

            await MenuCajaTargets.opcionCierreCaja(page).click();

            // Esperar a que el ERP procese la navegación (overload)
            await esperarCargaOverlay(page);

            llegamos = await estaEnCierreDeCaja(page);

            if (llegamos) {
                if (intento > 1) {
                    console.log(`[IrACierreDeCaja] Navegación exitosa en intento ${intento}`);
                }
                return;
            }

            console.warn(`[IrACierreDeCaja] Intento ${intento}/${MAX_INTENTOS} fallido — reintentando`);
            // Pausa antes del siguiente intento para dejar que el ERP se estabilice
            await page.waitForTimeout(1_000);
        }

        // Si después de todos los intentos no llegamos, falla con mensaje claro
        await expect(CierreCajaTargets.tituloCajaVenta(page))
            .toBeVisible({ timeout: 5_000 });
    };

    fn.displayName = 'Ir a Cierre de Caja';
    return fn;
};
