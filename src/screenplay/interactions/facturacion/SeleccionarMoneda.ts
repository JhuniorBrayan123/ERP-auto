import type { Page } from '@playwright/test';
import { esperarDebounce } from '@utils/wait-helpers';

type Moneda = 'soles' | 'dolares' | 'euros';

export const SeleccionarMoneda = (moneda: Moneda) => {
    const fn = async (page: Page): Promise<void> => {
        if (moneda === 'dolares') {
            await page.getByText('Precio dolares ($)').click();
            await esperarDebounce(page, 500, 'Esperar tras cambiar a dólares');
        } else if (moneda === 'euros') {
            await page.getByText('Precio euros (€)').click();
            await esperarDebounce(page, 500, 'Esperar tras cambiar a euros');
        }
    };
    fn.displayName = `Seleccionar moneda: ${moneda}`;
    return fn;
};
