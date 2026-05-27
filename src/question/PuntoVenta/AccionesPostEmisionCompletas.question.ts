import {type Page} from '@playwright/test';

export const AccionesPostEmisionCompletas = () =>
    async (page: Page): Promise<boolean> => {
        try {
            const checks = [
                page.locator('div').filter({ hasText: /^Enviar por WhatsApp$/ }).first(),
                page.locator('div').filter({ hasText: /^Enviar por Email$/ }).first(),
                page.locator('div').filter({ hasText: /^Copiar Link$/ }).first(),
                page.locator('div').filter({ hasText: /^Descargar XML$/ }).first(),
                page.locator('div').filter({ hasText: /^Descargar PDF$/ }).first(),
                page.getByRole('button', { name: 'Imprimir', exact: true }),
                page.getByRole('button', { name: 'Imprimir Ticket' }),
                page.getByRole('button', { name: 'Nueva Venta' }),
            ];
            for (const locator of checks) {
                await locator.waitFor({ state: 'visible', timeout: 5000 });
            }
            return true;
        } catch {
            return false;
        }
    };
