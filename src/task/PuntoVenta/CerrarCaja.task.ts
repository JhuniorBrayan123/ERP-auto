import {type Page} from '@playwright/test';

export const CerrarCajaActiva = (nombreCaja: string = 'caja-auto') => {
    const fn = async (page: Page): Promise<void> => {
        if (!page.url().includes('cajas')) {
            await page.goto('/punto-venta/cajas', {waitUntil: 'domcontentloaded'});
        }

        const cajaCard = page.locator('.detalle').filter({hasText: nombreCaja}).first();

        await cajaCard.waitFor({state: 'visible', timeout: 15000});

        const btnMenu = cajaCard.getByRole('button', {name: 'MENÚ'});
        if (await btnMenu.isVisible()) {
            await btnMenu.click();
            await page.getByText('Cierre de caja').click();
        } else {
            const btnDirecto = cajaCard.getByRole('button', {name: 'Cerrar caja'});
            if (await btnDirecto.isVisible()) {
                await btnDirecto.click();
            }
        }
        const btnModalCerrar = page.getByRole('button', {name: 'Cerrar caja'}).last();
        if (await btnModalCerrar.isVisible()) {
            await btnModalCerrar.click();
        }

        // --- Llenado Dinámico ---
        await page.waitForTimeout(1000);
        const inputs = page.getByRole('textbox', {name: 'S/'});
        const count = await inputs.count();

        for (let i = 0; i < count; i++) {
            // Evaluamos la fila donde está este input para extraer el saldo reportado
            const valor = await inputs.nth(i).evaluate((el) => {
                // Vuetify grids usan .v-row, o .row
                let row = el.closest('.v-row') || el.closest('.row') || el.parentElement?.parentElement?.parentElement;
                if (!row) return '0';

                const text = (row as HTMLElement).innerText || '';
                // Buscamos patrones como "S/ 862.10" ignorando espacios
                const matches = text.match(/S\/\s*([\d,]+\.?\d*)/g);
                if (matches && matches.length > 0) {
                    // Tomamos el primer valor encontrado que usualmente es el saldo del sistema
                    return matches[0].replace(/S\/\s*/, '').replace(/,/g, '');
                }
                return '0';
            });
            await inputs.nth(i).fill(valor);
        }
        const btnConfirmar = page.getByRole('button', {name: 'Confirmar cierre de caja'});
        if (await btnConfirmar.isVisible()) await btnConfirmar.click();

        const btnConfirmarExact = page.getByRole('button', {name: 'Confirmar cierre', exact: true});
        if (await btnConfirmarExact.isVisible()) await btnConfirmarExact.click();

        const btnAceptar = page.getByRole('button', {name: 'Aceptar'});
        if (await btnAceptar.isVisible()) await btnAceptar.click();

        await cajaCard.getByText('Aperturar caja').waitFor({state: 'visible', timeout: 15000}).catch(() => {
        });
    };
    fn.displayName = `Cerrar caja: ${nombreCaja}`;
    return fn;
};
