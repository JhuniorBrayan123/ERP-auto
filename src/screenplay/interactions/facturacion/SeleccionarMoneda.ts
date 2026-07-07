import {expect, type Page} from '@playwright/test';
import {esperarDebounce} from '@utils/wait-helpers';

type Moneda = 'soles' | 'dolares' | 'euros';

const OPCIONES: Record<Exclude<Moneda, 'soles'>, string> = {
    dolares: 'Precio dolares ($)',
    euros: 'Precio euros (€)',
};

export const SeleccionarMoneda = (moneda: Moneda) => {
    const fn = async (page: Page): Promise<void> => {
        if (moneda === 'soles') {
            return;
        }
        const header = page.locator('.v-select-header-base-form').filter({hasText: /Precio/}).first();
        await expect(header).toBeVisible({timeout: 5_000});
        await header.click();
        const dropdown = page.locator('.v-select-base-options.is-open').first();
        await expect(dropdown).toBeVisible({timeout: 3_000});
        const label = OPCIONES[moneda];
        await dropdown.locator('.v-select-form-option').filter({hasText: label}).click();
        await esperarDebounce(page, 500, `Esperar tras cambiar a ${moneda}`);
    };
    fn.displayName = `Seleccionar moneda: ${moneda}`;
    return fn;
};
