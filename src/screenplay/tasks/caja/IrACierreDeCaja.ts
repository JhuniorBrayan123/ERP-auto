import {expect, type Page} from '@playwright/test';
import {MenuCajaTargets} from '@screenplay/targets/caja/MenuCajaTargets';
import {CierreCajaTargets} from '@screenplay/targets/cierre-caja/CierreCajaTargets';
import {esperarCargaOverlaySiVisible} from '@utils/wait-helpers';

const MAX_INTENTOS = 3;


async function estaEnCierreDeCaja(page: Page): Promise<boolean> {
    return CierreCajaTargets.tituloResumenCaja(page)
        .isVisible({timeout: 4_000})
        .catch(() => false);
}


export const IrACierreDeCaja = () => {
    const fn = async (page: Page): Promise<void> => {
        let llegamos = false;

        for (let intento = 1; intento <= MAX_INTENTOS; intento++) {

            const menuAbierto = await MenuCajaTargets.opcionCierreCaja(page)
                .isVisible({timeout: 1_000})
                .catch(() => false);

            if (!menuAbierto) {
                await esperarCargaOverlaySiVisible(page);
                await MenuCajaTargets.btnAbrirMenu(page).waitFor({state: 'visible', timeout: 3000}).catch(() => {
                });
                await MenuCajaTargets.btnAbrirMenu(page).click({force: true});

                await page.waitForTimeout(1000);
            }

            try {
                await MenuCajaTargets.opcionCierreCaja(page).click({timeout: 2000});
            } catch (e) {
                console.warn(`[IrACierreDeCaja] No se pudo hacer clic en Cierre de caja en intento ${intento} — reintentando`);
                await page.waitForTimeout(1000);
                continue;
            }


            await esperarCargaOverlaySiVisible(page);

            llegamos = await estaEnCierreDeCaja(page);

            if (llegamos) {
                if (intento > 1) {
                    console.log(`[IrACierreDeCaja] Navegación exitosa en intento ${intento}`);
                }
                return;
            }

            console.warn(`[IrACierreDeCaja] Intento ${intento}/${MAX_INTENTOS} fallido — reintentando`);

            await page.waitForTimeout(1000);
        }


        await expect(CierreCajaTargets.tituloResumenCaja(page))
            .toBeVisible({timeout: 5_000});
    };

    fn.displayName = 'Ir a Cierre de Caja';
    return fn;
};
