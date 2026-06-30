import { expect, type Page } from '@playwright/test';
import { MenuCajaTargets } from '@screenplay/targets/caja/MenuCajaTargets';
import { CierreCajaTargets } from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import { esperarCargaOverlay } from '@utils/wait-helpers';

const MAX_INTENTOS = 3;



async function estaEnCierreDeCaja(page: Page): Promise<boolean> {
    return CierreCajaTargets.tituloCajaVenta(page)
        .isVisible({ timeout: 4_000 })
        .catch(() => false);
}


export const IrACierreDeCaja = () => {
    const fn = async (page: Page): Promise<void> => {
        let llegamos = false;

        for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
            
            const menuAbierto = await MenuCajaTargets.opcionCierreCaja(page)
                .isVisible({ timeout: 1_000 })
                .catch(() => false);

            if (!menuAbierto) {
                await MenuCajaTargets.btnAbrirMenu(page).click();
                
                await page.waitForTimeout(500);
            }

            await MenuCajaTargets.opcionCierreCaja(page).click();

            
            await esperarCargaOverlay(page);

            llegamos = await estaEnCierreDeCaja(page);

            if (llegamos) {
                if (intento > 1) {
                    console.log(`[IrACierreDeCaja] Navegación exitosa en intento ${intento}`);
                }
                return;
            }

            console.warn(`[IrACierreDeCaja] Intento ${intento}/${MAX_INTENTOS} fallido — reintentando`);
            
            await page.waitForTimeout(1_000);
        }

        
        await expect(CierreCajaTargets.tituloCajaVenta(page))
            .toBeVisible({ timeout: 5_000 });
    };

    fn.displayName = 'Ir a Cierre de Caja';
    return fn;
};
